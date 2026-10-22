"""Turns the cucumber step patterns into step templates.

The patterns come from input/cucumber.conf when that file exists; otherwise the
built-in DEFAULT_CONF below is used, so the app does not depend on the file.

Each line is `<given|when|then>-<name> = <regular expression>`. The
expressions use `@NAME@` placeholders and (named) groups. A step template is a list
of nodes the frontend renders as input fields:

  {"type": "text", "value": "..."}                       fixed wording
  {"type": "param", "name": "OBJECT_NAME"}               value the user has to enter
  {"type": "optional", "segments": [...]}                part that can be switched on
  {"type": "choice", "options": [{"label", "segments"}]} one of several wordings
"""

from __future__ import annotations

import re
from pathlib import Path

CONF_FILE = Path(__file__).resolve().parent.parent / "input" / "cucumber.conf"

# Built-in step definitions (same format as input/cucumber.conf).
DEFAULT_CONF = r"""
given-workflow = Workflow +@OBJECT_NAME@(?<tasks> +with tasks)?
given-variable-contains = Variable +@OBJECT_NAME@ +contains(?: +in +connection +@CONNECTION@)?
given-object-exists = Object +@OBJECT_NAME@ +(?:(?<positive>exists)|(?<negative>does +not +exist))(?: +in +connection +@CONNECTION@)?
given-folder-exists = Folder +@FOLDER@ +(?:(?<positive>exists)|(?<negative>does +not +exist))(?: +in +connection +@CONNECTION@)?(?<objects> +with objects)?
given-run-object = Object +@OBJECT_NAME@(:?\\(@ALIAS@\\))?(?: +on date @DATE@)? +(?:(?<success>ends +successfully)|(?<failure>fails))
given-resolve-agentgroup = Agent +group +@OBJECT_NAME@ +exists +and +can be +resolved
given-b4a-options = b4A +options
given-check-sync = Sync +@OBJECT_NAME@ +is +in +state +(?<state>[A-Z]+)(?: +with +value +(?<value>[0-9]+))?

when-set-variable = Set +values +of +variable +@OBJECT_NAME@ +to
when-reset-variable = Reset +variable +@OBJECT_NAME@(?: +to)?
when-remove-variable = Remove +values +from +variable +@OBJECT_NAME@
when-execute = Execute +@OBJECT_NAME@(:?\\(@ALIAS@\\))?(?: +on date @DATE@)?(?: +do not wait longer than @TIME@)?
when-wait = Wait +until(?: +@DATE@)? +@TIME@
when-save-variable = Remember +@OBJECT_VARIABLE@ +from +@TASK_NAME@ +of +@OBJECT_NAME@ +as +@VARIABLE@
when-b4a = Start b4A module +(?<module>[a-zA-Z.]+)
when-wait-for-task = Wait +for +task +@TASK_NAME@ +of +@OBJECT_NAME@ +for +@TIME@
when-cancel-task = Cancel(?: +@TASK_NAME@ +of)? +@OBJECT_NAME@(?:(?<recursive> +recursively))?
when-set-sync-state = Set +state +of +sync +@OBJECT_NAME@ +to +(?<state>[A-Z]+)(?: +with +operator +(?<operator>[-+=]{1}) +value +(?<value>[0-9]+))?
when-set-sync-action = Run +action +(?<action>[A-Z]+) on sync +@OBJECT_NAME@
when-create-temp-file = Create +a +(?:temporary +)?file +remembered +as +@VARIABLE@

then-workflow = Workflow +@OBJECT_NAME@(?<tasks> +with tasks)?
then-task-status = Task +status +of +@OBJECT_NAME@ +is
then-task-queue = Task +queue +of +@OBJECT_NAME@ +is
then-task-deactivated = Task +of +@OBJECT_NAME@ +is +deactivated
then-check-object = Check +if +@OBJECT_NAME@ +for +@ALIAS@(:? +on date @DATE@)? +(:?(?<success>ended +successfully)|(?<failure>has +failed))
then-task-has-comment = Comment +of +task +@TASK_NAME@ +of +@OBJECT_NAME@ +contains +(?<text>'[^']+'|"[^"]+")
then-b4a-exitcode = Exitcode +of +b4A +module +(?<module>[a-zA-Z.]+) +is +(?<exitcode>[0-9]+)
then-b4a-report = Report +of +b4A +module +(?<module>[a-zA-Z.]+)(?: +(?<not>does not))? +contains? +(?<pattern>.+)
then-compare-variable = Compare +variable +@VARIABLE@ +to +(?<pattern>.+)
then-check-report = Check +report +@REPORTTYPE@(?: +of +@TASK_NAME@)? +from @OBJECT_NAME@ +for+(?: +(?<nomatch>no +match +of))? +(?<pattern>.+)
then-variable-contains = Check +variable +@OBJECT_NAME@ +contains(?: +in +connection +@CONNECTION@)?
then-object-exists = Check +object @OBJECT_NAME@ +(?:(?<positive>exists)|(?<negative>does +not +exist))(?: +in +connection +@CONNECTION@)?
then-xml-export-contains = Check +if +XML +export +of +object @OBJECT_NAME@(?: +in +connection +@CONNECTION@)? +(?:(?<positive>contains)|(?<negative>does +not +contain)) +(?<pattern>.+)
then-folder-exists = Check +folder @FOLDER@ +(?:(?<positive>exists)|(?<negative>does +not +exist))(?: +in +connection +@CONNECTION@)?(?<objects> +with objects)?
then-set-sync-state = Set +state +of +sync +@OBJECT_NAME@ +to +(?<state>[A-Z]+)(?: +with +operator +(?<operator>[-+=]{1}) +value +(?<value>[0-9]+))?
then-set-sync-action = Run +action +(?<action>[A-Z]+) on sync +@OBJECT_NAME@
then-check-sync = Check +if +sync +@OBJECT_NAME@ +is +in +state +(?<state>[A-Z]+)(?: +with +value +(?<value>[0-9]+))?
then-check-messages = Check +if +message +(?:(?<positive>exists)|(?<negative>does +not +exist)) +with +number U?(?<number>[0-9]+) +and +pattern +(?<pattern>.+)
"""


_PLACEHOLDER = re.compile(r"@([A-Z_]+)@")
_KEY = re.compile(r"(given|when|then)-([a-z0-9-]+)")


def _is_param(raw: str) -> bool:
    """True if a group only matches free input such as [0-9]+, .+ or a quoted string."""
    t = re.sub(r"\[[^\]]*\]", "", raw)
    t = re.sub(r"\{[0-9,]*\}", "", t)
    t = re.sub(r"[+*?.|'\"\\ ]", "", t)
    return not re.search(r"[A-Za-z]", t)


def _label(nodes: list[dict]) -> str:
    parts: list[str] = []
    for n in nodes:
        if n["type"] == "text":
            parts.append(n["value"])
        elif n["type"] == "param":
            parts.append(f"<{n['name']}>")
        elif n["type"] == "optional":
            parts.append(f"[{_label(n['segments']).strip()}]")
        else:
            parts.append("{" + " | ".join(o["label"].strip() for o in n["options"]) + "}")
    return re.sub(r"\s+", " ", "".join(parts)).strip()


def _normalize(nodes: list[dict]) -> list[dict]:
    out: list[dict] = []
    for n in nodes:
        if n["type"] == "optional":
            n = {"type": "optional", "segments": _normalize(n["segments"])}
        elif n["type"] == "choice":
            n = {
                "type": "choice",
                "options": [{"label": o["label"], "segments": _normalize(o["segments"])} for o in n["options"]],
            }
        if n["type"] == "text" and out and out[-1]["type"] == "text":
            out[-1] = {"type": "text", "value": out[-1]["value"] + n["value"]}
        else:
            out.append(n)
    for n in out:
        if n["type"] == "text":
            n["value"] = re.sub(r" {2,}", " ", n["value"])
    return out


class _Parser:
    def __init__(self, pattern: str) -> None:
        self.s = pattern
        self.i = 0

    def parse(self) -> list[dict]:
        return _normalize(self._alternatives(nested=False)[0])

    def _alternatives(self, nested: bool) -> list[list[dict]]:
        alts: list[list[dict]] = [[]]
        while self.i < len(self.s):
            c = self.s[self.i]
            if c == ")":
                if nested:
                    return alts
                raise ValueError("unbalanced )")
            if c == "|":
                alts.append([])
                self.i += 1
            else:
                self._item(alts[-1])
        if nested:
            raise ValueError("missing )")
        return alts

    def _text(self, out: list[dict], value: str) -> None:
        out.append({"type": "text", "value": value})

    def _item(self, out: list[dict]) -> None:
        s, i = self.s, self.i
        c = s[i]
        if c == "(":
            self._group(out)
        elif c == "@" and (m := _PLACEHOLDER.match(s, i)):
            out.append({"type": "param", "name": m.group(1)})
            self.i = m.end()
        elif c == "\\":
            if i + 1 < len(s):
                self._text(out, s[i + 1])
            self.i += 2
        elif c == "[":
            self.i = s.index("]", i) + 1
            out.append({"type": "param", "name": "value"})
        elif c == ".":
            out.append({"type": "param", "name": "value"})
            self.i += 1
        elif c == "{":
            self.i = s.index("}", i) + 1
        elif c in "+*?":
            self.i += 1  # quantifier of the previous literal
        else:
            self._text(out, c)
            self.i += 1

    def _group(self, out: list[dict]) -> None:
        s = self.s
        i = self.i
        name = None
        if s.startswith("(?:", i) or s.startswith("(:?", i):
            i += 3
        elif s.startswith("(?<", i):
            j = s.index(">", i)
            name = s[i + 3 : j]
            i = j + 1
        else:
            i += 1
        self.i = start = i
        alts = self._alternatives(nested=True)
        raw = s[start : self.i]
        self.i += 1  # the closing parenthesis
        optional = False
        while self.i < len(s) and s[self.i] in "?+*":
            optional = optional or s[self.i] in "?*"
            self.i += 1

        if name and _is_param(raw):
            node = [{"type": "param", "name": name}]
        elif len(alts) > 1:
            node = [
                {
                    "type": "choice",
                    "options": [{"label": _label(_normalize(a)), "segments": a} for a in alts],
                }
            ]
        else:
            node = alts[0]
        if optional:
            out.append({"type": "optional", "segments": node})
        else:
            out.extend(node)


def load_steps(path: Path = CONF_FILE) -> list[dict]:
    """Step templates of the configuration file, or of DEFAULT_CONF if the file is missing."""
    try:
        text = path.read_text(encoding="utf-8") if path.is_file() else DEFAULT_CONF
    except OSError:
        text = DEFAULT_CONF
    steps: list[dict] = []
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, pattern = line.partition("=")
        m = _KEY.fullmatch(key.strip())
        if not m:
            continue
        try:
            # the file is properties style: a doubled backslash is one backslash
            segments = _Parser(pattern.strip().replace("\\\\", "\\")).parse()
        except ValueError:
            continue
        steps.append(
            {
                "id": key.strip(),
                "keyword": m.group(1).capitalize(),
                "label": _label(segments),
                "segments": segments,
            }
        )
    return steps
