import {
  Fragment,
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import {
  Alert,
  AlertTitle,
  Autocomplete,
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Dialog,
  GlobalStyles,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControlLabel,
  InputAdornment,
  LinearProgress,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
  useMediaQuery,
} from '@mui/material'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import CodeIcon from '@mui/icons-material/Code'
import ScienceIcon from '@mui/icons-material/Science'
import VerifiedIcon from '@mui/icons-material/Verified'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DnsIcon from '@mui/icons-material/Dns'
import LockIcon from '@mui/icons-material/Lock'
import SearchIcon from '@mui/icons-material/Search'
import HistoryIcon from '@mui/icons-material/History'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import AddIcon from '@mui/icons-material/Add'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import RefreshIcon from '@mui/icons-material/Refresh'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import LoginIcon from '@mui/icons-material/Login'
import UpdateIcon from '@mui/icons-material/Update'

type LoginStatus = 'ok' | 'error' | 'pending'

interface StatusResponse {
  // 'disabled' = no b4A ReST API settings in the backend's .env
  status: LoginStatus | 'disabled'
  message: string
  expires_at: string | null
  seconds_remaining: number | null
  last_checked: string | null
  username: string | null
}

interface PackageRecord {
  id: number
  releaseId: number | null
  receivedAt: string
  packageName: string
  source: string
  version: string
}

interface ReleaseLogEntry {
  id: number
  loggedAt: string
  event: string
  message: string
}

interface ReleaseRecord {
  id: number
  name: string
  description: string
  startDate: string | null
  endDate: string | null
  status: number
}

const RELEASE_STATUSES: { value: number; label: string; color: 'info' | 'success' | 'default' }[] = [
  { value: 1, label: 'Planned', color: 'info' },
  { value: 2, label: 'Active', color: 'success' },
  { value: 3, label: 'Closed', color: 'default' },
]

type EnvironmentId = 'development' | 'test' | 'production'

interface TestCaseRecord {
  id: number
  packageName: string
  version: string
  name: string
  description: string
  scenario: string
}

// Step templates read from input/cucumber.conf (see app/cucumber.py).
type StepNode =
  | { type: 'text'; value: string }
  | { type: 'param'; name: string }
  | { type: 'optional'; segments: StepNode[] }
  | { type: 'choice'; options: { label: string; segments: StepNode[] }[] }

interface CucumberStep {
  id: string
  keyword: 'Given' | 'When' | 'Then'
  label: string
  segments: StepNode[]
}

type StepValues = Record<string, string | boolean | number>

interface ScenarioStep {
  stepId: string | null
  values: StepValues
}

// Values are keyed by the position of the node in the template ("r.2", "r.3.1.0", ...).
function stepText(nodes: StepNode[], path: string, values: StepValues): string {
  return nodes
    .map((n, i) => {
      const p = `${path}.${i}`
      if (n.type === 'text') return n.value
      if (n.type === 'param') return String(values[p] ?? '').trim() || `<${n.name}>`
      if (n.type === 'optional') return values[p] === true ? stepText(n.segments, p, values) : ''
      const idx = Number(values[p] ?? 0)
      return stepText((n.options[idx] ?? n.options[0]).segments, `${p}.${idx}`, values)
    })
    .join('')
}

function stepComplete(nodes: StepNode[], path: string, values: StepValues): boolean {
  return nodes.every((n, i) => {
    const p = `${path}.${i}`
    if (n.type === 'param') return String(values[p] ?? '').trim() !== ''
    if (n.type === 'optional') return values[p] !== true || stepComplete(n.segments, p, values)
    if (n.type === 'choice') {
      const idx = Number(values[p] ?? 0)
      return stepComplete((n.options[idx] ?? n.options[0]).segments, `${p}.${idx}`, values)
    }
    return true
  })
}

function buildScenario(
  packageName: string,
  version: string,
  name: string,
  steps: ScenarioStep[],
  definitions: CucumberStep[],
): string {
  if (steps.length === 0) return ''
  let previous = ''
  const lines = steps.map((st) => {
    const def = definitions.find((d) => d.id === st.stepId)!
    const keyword = def.keyword === previous ? 'And' : def.keyword
    previous = def.keyword
    return `    ${keyword} ${stepText(def.segments, 'r', st.values).replace(/\s+/g, ' ').trim()}`
  })
  return [`Feature: ${packageName} ${version}`, '', `  Scenario: ${name.trim()}`, ...lines].join('\n')
}

interface ConnectionRecord {
  id: number
  environment: EnvironmentId
  name: string
  description: string
}

const ENVIRONMENTS: { id: EnvironmentId; label: string; color: string; icon: ReactNode }[] = [
  { id: 'development', label: 'Development', color: 'info.main', icon: <CodeIcon /> },
  { id: 'test', label: 'Test', color: 'warning.main', icon: <ScienceIcon /> },
  { id: 'production', label: 'Production', color: 'success.main', icon: <VerifiedIcon /> },
]

interface TokenResponse {
  token: string
  expires_at: string | null
  username: string | null
}

const POLL_INTERVAL_MS = 5000

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'packages', label: 'Packages', icon: <Inventory2Icon /> },
  { id: 'releases', label: 'Releases', icon: <RocketLaunchIcon />, disabled: true },
  { id: 'environments', label: 'Environments', icon: <DnsIcon /> },
  { id: 'testpage', label: 'Test', icon: <ScienceIcon /> },
] as const

type View = (typeof SIDEBAR_ITEMS)[number]['id']
const SIDEBAR_WIDTH = { xs: 64, md: 220 }

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: { default: '#f4f6f8' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: { defaultProps: { variant: 'outlined' } },
  },
})

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

// Monitoring: an active release without an end date is highlighted in light magenta.
const MONITOR_COLOR = '#fbd0f3'
const MONITOR_BORDER = '#d946c0'
const MONITOR_HINT = 'Active release without an end date'

function isMonitored(r: ReleaseRecord): boolean {
  return r.status === 2 && !r.endDate
}

// Share of the release period that has elapsed (0-100), or null without both dates.
function releaseProgress(r: ReleaseRecord): number | null {
  if (!r.startDate || !r.endDate) return null
  const start = new Date(r.startDate).getTime()
  const end = new Date(r.endDate).getTime()
  if (end <= start) return null
  return Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100))
}

function formatRemaining(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return '—'
  if (seconds <= 0) return 'expired'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts: string[] = []
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m}m`)
  if (!h) parts.push(`${s}s`)
  return parts.join(' ')
}

const STATUS_CONFIG: Record<
  LoginStatus,
  {
    badgeColor: 'success' | 'error' | 'warning'
    avatarColor: 'success.main' | 'error.main' | 'warning.main'
    icon: ReactNode
    label: string
  }
> = {
  ok: {
    badgeColor: 'success',
    avatarColor: 'success.main',
    icon: <CheckCircleIcon />,
    label: 'Connected',
  },
  error: {
    badgeColor: 'error',
    avatarColor: 'error.main',
    icon: <CancelIcon />,
    label: 'Not connected',
  },
  pending: {
    badgeColor: 'warning',
    avatarColor: 'warning.main',
    icon: <HourglassEmptyIcon />,
    label: 'Checking…',
  },
}

function App({ clerkEnabled = false }: { clerkEnabled?: boolean }) {
  const [data, setData] = useState<StatusResponse | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  // The b4A bearer token, available to the whole dashboard (null = logged out).
  const [token, setToken] = useState<string | null>(null)
  const [loginUser, setLoginUser] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [packages, setPackages] = useState<PackageRecord[]>([])
  const [releases, setReleases] = useState<ReleaseRecord[]>([])
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false)
  const [releaseForm, setReleaseForm] = useState({ name: '', description: '', startDate: '', endDate: '' })
  const [moveError, setMoveError] = useState<string | null>(null)
  const [packageToDelete, setPackageToDelete] = useState<PackageRecord | null>(null)
  const [releaseToDelete, setReleaseToDelete] = useState<{ id: number; name: string } | null>(null)
  const [releaseError, setReleaseError] = useState<string | null>(null)
  // Below the md breakpoint the sidebar shows icons only, so they need tooltips.
  const compactSidebar = useMediaQuery(theme.breakpoints.down('md'))
  const [connections, setConnections] = useState<ConnectionRecord[]>([])
  const [connectionDialog, setConnectionDialog] = useState<EnvironmentId | null>(null)
  const [connectionForm, setConnectionForm] = useState({ name: '', description: '' })
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [testCases, setTestCases] = useState<TestCaseRecord[]>([])
  const [testCaseDialog, setTestCaseDialog] = useState<{ packageName: string; version: string } | null>(null)
  const [testCaseForm, setTestCaseForm] = useState({ name: '', description: '' })
  const [testCaseError, setTestCaseError] = useState<string | null>(null)
  const [cucumberSteps, setCucumberSteps] = useState<CucumberStep[]>([])
  const [scenarioSteps, setScenarioSteps] = useState<ScenarioStep[]>([])
  const [viewTestCase, setViewTestCase] = useState<TestCaseRecord | null>(null)
  const [editingDescription, setEditingDescription] = useState<{ id: number; text: string } | null>(null)
  const [editingConnection, setEditingConnection] = useState<{ id: number; text: string } | null>(null)
  const [detailReleaseId, setDetailReleaseId] = useState<number | null>(null)
  const [releaseLog, setReleaseLog] = useState<ReleaseLogEntry[]>([])
  const [view, setView] = useState<View>('dashboard')
  const [packageSearch, setPackageSearch] = useState('')
  const [releaseFilter, setReleaseFilter] = useState<'all' | number>('all')
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: StatusResponse = await res.json()
      setData(json)
      setFetchError(null)
      if (json.status === 'ok') {
        const tokenRes = await fetch('/api/token', { cache: 'no-store' })
        setToken(tokenRes.ok ? ((await tokenRes.json()) as TokenResponse).token : null)
      } else {
        setToken(null)
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load status')
    }
  }, [])

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setPackages(await res.json())
    } catch {
      // keep the last known list; connection problems show in the info popover
    }
  }, [])

  const fetchReleases = useCallback(async () => {
    try {
      const res = await fetch('/api/releases', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setReleases(await res.json())
    } catch {
      // keep the last known list
    }
  }, [])

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch('/api/connections', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setConnections(await res.json())
    } catch {
      // keep the last known list
    }
  }, [])

  const fetchTestCases = useCallback(async () => {
    try {
      const res = await fetch('/api/test-cases', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setTestCases(await res.json())
    } catch {
      // keep the last known list
    }
  }, [])

  const fetchCucumberSteps = useCallback(async () => {
    try {
      const res = await fetch('/api/cucumber/steps', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setCucumberSteps(await res.json())
    } catch {
      setCucumberSteps([])
    }
  }, [])

  const updateScenarioStep = (index: number, step: ScenarioStep) =>
    setScenarioSteps((prev) => prev.map((st, k) => (k === index ? step : st)))

  // Renders the input fields of a step template; the generated text is shown as a preview below the steps.
  const renderStepNodes = (nodes: StepNode[], path: string, step: ScenarioStep, index: number, showText = true): ReactNode =>
    nodes.map((n, i) => {
      const p = `${path}.${i}`
      const setValue = (v: string | boolean | number) =>
        updateScenarioStep(index, { ...step, values: { ...step.values, [p]: v } })
      if (n.type === 'text') {
        return showText && n.value.trim() ? (
          <Typography key={p} variant="body2" color="text.secondary">
            {n.value.trim()}
          </Typography>
        ) : null
      }
      if (n.type === 'param') {
        return (
          <TextField
            key={p}
            required
            size="small"
            label={n.name}
            value={String(step.values[p] ?? '')}
            onChange={(e) => setValue(e.target.value)}
          />
        )
      }
      if (n.type === 'optional') {
        const on = step.values[p] === true
        return (
          <Fragment key={p}>
            <FormControlLabel
              control={<Checkbox size="small" checked={on} onChange={(e) => setValue(e.target.checked)} />}
              label={stepText(n.segments, p, {}).trim()}
            />
            {on && renderStepNodes(n.segments, p, step, index, false)}
          </Fragment>
        )
      }
      const idx = Number(step.values[p] ?? 0)
      const option = n.options[idx] ?? n.options[0]
      return (
        <Fragment key={p}>
          <Select size="small" value={idx} onChange={(e) => setValue(Number(e.target.value))}>
            {n.options.map((o, k) => (
              <MenuItem key={o.label} value={k}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
          {renderStepNodes(option.segments, `${p}.${idx}`, step, index, false)}
        </Fragment>
      )
    })

  const scenarioReady = scenarioSteps.every((st) => {
    const def = cucumberSteps.find((d) => d.id === st.stepId)
    return def !== undefined && stepComplete(def.segments, 'r', st.values)
  })

  const handleCreateTestCase = async (event: FormEvent) => {
    event.preventDefault()
    if (!testCaseDialog) return
    setTestCaseError(null)
    try {
      const res = await fetch('/api/test-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testCaseDialog,
          ...testCaseForm,
          scenario: buildScenario(
            testCaseDialog.packageName,
            testCaseDialog.version,
            testCaseForm.name,
            scenarioSteps,
            cucumberSteps,
          ),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        const detail = body?.detail
        throw new Error(
          typeof detail === 'string' ? detail : Array.isArray(detail) ? detail[0]?.msg : `HTTP ${res.status}`,
        )
      }
      setTestCaseDialog(null)
      setTestCaseForm({ name: '', description: '' })
      setScenarioSteps([])
      await fetchTestCases()
    } catch (err) {
      setTestCaseError(err instanceof Error ? err.message : 'Failed to create test case')
    }
  }

  const handleDeleteTestCase = async (id: number) => {
    try {
      await fetch(`/api/test-cases/${id}`, { method: 'DELETE' })
    } finally {
      await fetchTestCases()
    }
  }

  const handleCreateConnection = async (event: FormEvent) => {
    event.preventDefault()
    setConnectionError(null)
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...connectionForm, environment: connectionDialog }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        const detail = body?.detail
        throw new Error(
          typeof detail === 'string' ? detail : Array.isArray(detail) ? detail[0]?.msg : `HTTP ${res.status}`,
        )
      }
      setConnectionDialog(null)
      setConnectionForm({ name: '', description: '' })
      await fetchConnections()
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : 'Failed to create connection')
    }
  }

  const handleCreateRelease = async (event: FormEvent) => {
    event.preventDefault()
    setReleaseError(null)
    try {
      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...releaseForm,
          startDate: releaseForm.startDate || null,
          endDate: releaseForm.endDate || null,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        const detail = body?.detail
        throw new Error(
          typeof detail === 'string' ? detail : Array.isArray(detail) ? detail[0]?.msg : `HTTP ${res.status}`,
        )
      }
      setReleaseDialogOpen(false)
      setReleaseForm({ name: '', description: '', startDate: '', endDate: '' })
      await fetchReleases()
    } catch (err) {
      setReleaseError(err instanceof Error ? err.message : 'Failed to create release')
    }
  }

  // Assigns a package to a release (or unassigns it with null). Closed releases refuse both.
  const deletePackage = async (pkg: PackageRecord) => {
    setMoveError(null)
    setPackageToDelete(null)
    try {
      const res = await fetch(`/api/packages/${pkg.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(typeof body?.detail === 'string' ? body.detail : `HTTP ${res.status}`)
      }
    } catch (err) {
      setMoveError(err instanceof Error ? err.message : 'Failed to delete package')
    } finally {
      await fetchPackages()
    }
  }

  const deleteRelease = async (rel: { id: number; name: string }) => {
    setMoveError(null)
    setReleaseToDelete(null)
    try {
      const res = await fetch(`/api/releases/${rel.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(typeof body?.detail === 'string' ? body.detail : `HTTP ${res.status}`)
      }
    } catch (err) {
      setMoveError(err instanceof Error ? err.message : 'Failed to delete release')
    } finally {
      await Promise.all([fetchReleases(), fetchPackages()])
    }
  }

  const movePackage = async (packageId: number, releaseId: number | null) => {
    setMoveError(null)
    try {
      const res = await fetch(`/api/packages/${packageId}/release`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(typeof body?.detail === 'string' ? body.detail : `HTTP ${res.status}`)
      }
    } catch (err) {
      setMoveError(err instanceof Error ? err.message : 'Failed to move package')
    } finally {
      await fetchPackages()
    }
  }

  const handleReleaseDates = async (r: ReleaseRecord, dates: Partial<Pick<ReleaseRecord, 'startDate' | 'endDate'>>) => {
    const next = { startDate: r.startDate, endDate: r.endDate, ...dates }
    setReleases((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...next } : x)))
    try {
      await fetch(`/api/releases/${r.id}/dates`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
    } finally {
      await fetchReleases()
    }
  }

  const fetchReleaseLog = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/releases/${id}/log`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setReleaseLog(await res.json())
    } catch {
      // keep the last known log
    }
  }, [])

  // While the details modal is open, load the log and keep it current.
  useEffect(() => {
    if (detailReleaseId === null) return
    setReleaseLog([])
    fetchReleaseLog(detailReleaseId)
    const id = setInterval(() => fetchReleaseLog(detailReleaseId), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [detailReleaseId, fetchReleaseLog])

  // Clicking a release card opens its details, except when the click was on a control inside it.
  const openReleaseDetails = (e: MouseEvent<HTMLElement>, id: number) => {
    const target = e.target as HTMLElement
    if (target.closest('button, input, textarea, a, [role="combobox"], [role="listbox"], .MuiChip-root, .MuiSelect-root')) return
    setDetailReleaseId(id)
  }

  const handleConnectionDescription = async (id: number, description: string) => {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, description: description.trim() } : c)))
    try {
      await fetch(`/api/connections/${id}/description`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
    } finally {
      await fetchConnections()
    }
  }

  const handleReleaseDescription = async (id: number, description: string) => {
    setReleases((prev) => prev.map((r) => (r.id === id ? { ...r, description: description.trim() } : r)))
    try {
      const res = await fetch(`/api/releases/${id}/description`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setMoveError(typeof body?.detail === 'string' ? body.detail : `HTTP ${res.status}`)
      }
    } finally {
      await fetchReleases()
    }
  }

  const handleReleaseStatus = async (id: number, status: number) => {
    // optimistic update; the refetch restores the real value if the call fails
    setReleases((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    try {
      await fetch(`/api/releases/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } finally {
      await fetchReleases()
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchPackages()
    fetchReleases()
    fetchConnections()
    fetchTestCases()
    const id = setInterval(() => {
      fetchStatus()
      fetchPackages()
      fetchReleases()
      fetchConnections()
      fetchTestCases()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchStatus, fetchPackages, fetchReleases, fetchConnections, fetchTestCases])

  // One entry per package name and version, whatever the source or the number of deliveries.
  const testEntries = Object.values(
    packages.reduce<Record<string, { packageName: string; version: string; sources: Set<string> }>>((acc, p) => {
      const key = JSON.stringify([p.packageName, p.version])
      const entry = (acc[key] ??= { packageName: p.packageName, version: p.version, sources: new Set() })
      entry.sources.add(p.source)
      return acc
    }, {}),
  ).sort((a, b) => a.packageName.localeCompare(b.packageName) || a.version.localeCompare(b.version, undefined, { numeric: true }))

  const unassignedPackages = packages.filter((p) => p.releaseId === null)
  const search = packageSearch.trim().toLowerCase()
  // Only packages whose source matches a defined Development connection can be planned.
  const developmentSources = new Set(
    connections.filter((c) => c.environment === 'development').map((c) => c.name.trim().toLowerCase()),
  )
  // Packages the webhook received from connections that are not a defined Development connection.
  const otherSourceCounts = packages
    .filter((p) => !developmentSources.has(p.source.trim().toLowerCase()))
    .reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.source]: (acc[p.source] ?? 0) + 1 }), {})
  const otherSourceTotal = Object.values(otherSourceCounts).reduce((a, b) => a + b, 0)
  const visiblePackages = packages.filter(
    (p) => !search || `${p.packageName} ${p.source} ${p.version}`.toLowerCase().includes(search),
  )
  const visibleReleases = releases.filter((r) => releaseFilter === 'all' || r.status === releaseFilter)
  const stats = [
    { label: 'Unassigned packages', value: unassignedPackages.length, color: 'warning.main', icon: <Inventory2Icon /> },
    ...RELEASE_STATUSES.map((st) => ({
      label: `${st.label} releases`,
      value: releases.filter((r) => r.status === st.value).length,
      color: st.value === 1 ? 'info.main' : st.value === 2 ? 'success.main' : 'text.disabled',
      icon: <RocketLaunchIcon />,
    })),
  ]

  const handleRetry = async () => {
    setIsRefreshing(true)
    try {
      await fetch('/api/refresh', { method: 'POST' })
      await fetchStatus()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoggingIn(true)
    setLoginError(null)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPassword }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const state: StatusResponse = await res.json()
      if (state.status !== 'ok') setLoginError(state.message)
      else setLoginPassword('')
      await fetchStatus()
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleInfoOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleInfoClose = () => {
    setAnchorEl(null)
  }

  const b4aEnabled = data?.status !== 'disabled'
  const status: LoginStatus = data && data.status !== 'disabled' ? data.status : 'pending'
  const config = STATUS_CONFIG[status]
  const infoOpen = Boolean(anchorEl)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ 'html, body, #root': { height: '100%' } }} />

      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Release Manager
          </Typography>

          {/* Informational cloud mode (no b4A login): sign in with Clerk instead. */}
          {!b4aEnabled && clerkEnabled && (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button color="inherit" startIcon={<LoginIcon />}>
                    Sign in
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </>
          )}

          {b4aEnabled && (
          <IconButton
            color="inherit"
            onClick={handleInfoOpen}
            aria-label="connection information"
            aria-haspopup="true"
            aria-controls={infoOpen ? 'connection-info-popover' : undefined}
          >
            <Badge color={config.badgeColor} variant="dot" overlap="circular">
              <InfoIcon />
            </Badge>
          </IconButton>
          )}

          <Popover
            id="connection-info-popover"
            open={infoOpen && b4aEnabled}
            anchorEl={anchorEl}
            onClose={handleInfoClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ p: 2, width: 340 }}>
              <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: config.avatarColor }}>{config.icon}</Avatar>
                <Box>
                  <Typography variant="subtitle1">{config.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last checked: {formatDateTime(data?.last_checked ?? null)}
                  </Typography>
                </Box>
              </Stack>

              <Chip
                icon={<AccessTimeIcon />}
                label={`Expires: ${formatDateTime(data?.expires_at ?? null)}`}
                color={status === 'ok' ? 'success' : 'default'}
                variant="outlined"
                sx={{ mb: 1.5 }}
              />

              <Divider sx={{ mb: 1 }} />

              <List dense disablePadding>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <UpdateIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Time remaining"
                    secondary={formatRemaining(data?.seconds_remaining ?? null)}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Account" secondary={data?.username ?? '—'} />
                </ListItem>
              </List>

              {data?.message && (
                <Alert
                  severity={status === 'error' ? 'error' : status === 'ok' ? 'success' : 'info'}
                  sx={{ mt: 1.5 }}
                >
                  {data.message}
                </Alert>
              )}

              {fetchError && (
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                  Could not reach the backend: {fetchError}
                </Alert>
              )}

              {token ? (
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center' }}>
                  <Chip size="small" color="success" label="Token available" />
                  <Typography variant="caption" sx={{ flexGrow: 1 }} noWrap>
                    {token.slice(0, 18)}…
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label="copy token"
                    onClick={() => navigator.clipboard?.writeText(token)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : (
                <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
                  <Stack spacing={1.5}>
                    <TextField
                      size="small"
                      label="Username (USER/DEPARTMENT)"
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      autoComplete="username"
                    />
                    <TextField
                      size="small"
                      type="password"
                      label="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    {loginError && <Alert severity="error">{loginError}</Alert>}
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      startIcon={isLoggingIn ? <CircularProgress size={16} /> : <LoginIcon />}
                      disabled={isLoggingIn || !loginUser || !loginPassword}
                    >
                      Log in
                    </Button>
                  </Stack>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                  onClick={handleRetry}
                  disabled={isRefreshing}
                >
                  Retry now
                </Button>
              </Box>
            </Box>
          </Popover>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', overflowX: 'hidden' },
        }}
      >
        <Toolbar />
        <List component="nav" aria-label="main navigation">
          {SIDEBAR_ITEMS.map((item) => (
            <Tooltip key={item.id} title={item.label} placement="right" disableHoverListener={!compactSidebar}>
              <ListItemButton
                disabled={'disabled' in item && item.disabled}
                selected={view === item.id}
                onClick={() => setView(item.id)}
                sx={{ px: { xs: 2.5, md: 3 } }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: { xs: 0, md: 2 }, color: view === item.id ? 'primary.main' : undefined }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ display: { xs: 'none', md: 'block' } }} />
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
      <Toolbar />
      <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="xl">
          {view === 'testpage' && (
            <>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Test
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Test coverage per package name and version. Entries without a test case are shown in magenta.
              </Typography>

              <Card>
                <CardContent>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                    <ScienceIcon color="primary" />
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                      Package test cases
                    </Typography>
                    <Chip
                      size="small"
                      label={`${testEntries.filter((e) => !testCases.some((t) => t.packageName === e.packageName && t.version === e.version)).length} without test case`}
                    />
                  </Stack>
                  {testEntries.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                      No packages received yet.
                    </Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Package</TableCell>
                            <TableCell>Version</TableCell>
                            <TableCell>Sources</TableCell>
                            <TableCell>Test cases</TableCell>
                            <TableCell align="right" />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {testEntries.map((e) => {
                            const cases = testCases.filter((t) => t.packageName === e.packageName && t.version === e.version)
                            return (
                              <TableRow
                                key={`${e.packageName}\u0000${e.version}`}
                                hover={cases.length > 0}
                                title={cases.length === 0 ? 'No test case defined for this package version' : undefined}
                                sx={cases.length === 0 ? { bgcolor: MONITOR_COLOR } : undefined}
                              >
                                <TableCell sx={{ fontWeight: 500 }}>{e.packageName}</TableCell>
                                <TableCell>
                                  <Chip size="small" variant="outlined" label={e.version} />
                                </TableCell>
                                <TableCell>{[...e.sources].join(', ')}</TableCell>
                                <TableCell>
                                  {cases.length === 0 ? (
                                    <Chip size="small" icon={<WarningAmberIcon />} label="No test case" />
                                  ) : (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                      {cases.map((t) => (
                                        <Chip
                                          key={t.id}
                                          size="small"
                                          color="success"
                                          variant="outlined"
                                          label={t.name}
                                          title={t.description || undefined}
                                          onClick={t.scenario ? () => setViewTestCase(t) : undefined}
                                          onDelete={() => void handleDeleteTestCase(t.id)}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  <Tooltip title="Add test case">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      aria-label={`add test case for ${e.packageName} ${e.version}`}
                                      onClick={() => {
                                        setTestCaseError(null)
                                        setTestCaseForm({ name: '', description: '' })
                                        setScenarioSteps([])
                                        void fetchCucumberSteps()
                                        setTestCaseDialog({ packageName: e.packageName, version: e.version })
                                      }}
                                    >
                                      <AddIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </>
          )}
          {view === 'environments' && (
            <>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Environments
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Systems and clients that packages are released to.
              </Typography>
              <Stack spacing={3}>
                {ENVIRONMENTS.map((env) => {
                  const items = connections.filter((c) => c.environment === env.id)
                  return (
                    <Card key={env.id} sx={{ borderLeft: 4, borderLeftColor: env.color }}>
                      <CardContent>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: env.color, width: 36, height: 36 }}>{env.icon}</Avatar>
                          <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                            {env.label}
                          </Typography>
                          <Chip size="small" label={items.length} />
                          <Tooltip title={`New ${env.label} connection`}>
                            <IconButton
                              color="primary"
                              aria-label={`add ${env.label} connection`}
                              onClick={() => {
                                setConnectionError(null)
                                setConnectionDialog(env.id)
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        {items.length === 0 ? (
                          <Alert severity="info" variant="outlined">
                            No connections yet. Use + to define one.
                          </Alert>
                        ) : (
                          <Box
                            sx={{
                              display: 'grid',
                              gap: 1.5,
                              gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
                            }}
                          >
                            {items.map((c) => (
                              <Paper key={c.id} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <DnsIcon color="action" />
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                  <Typography variant="subtitle2" noWrap>
                                    {c.name}
                                  </Typography>
                                  {editingConnection?.id === c.id ? (
                                    <TextField
                                      autoFocus
                                      fullWidth
                                      multiline
                                      size="small"
                                      label="Description"
                                      sx={{ mt: 0.5 }}
                                      value={editingConnection.text}
                                      onChange={(e) => setEditingConnection({ id: c.id, text: e.target.value })}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Escape') setEditingConnection(null)
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault()
                                          void handleConnectionDescription(c.id, editingConnection.text)
                                          setEditingConnection(null)
                                        }
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                                      {c.description || 'No description'}
                                    </Typography>
                                  )}
                                </Box>
                                {editingConnection?.id === c.id ? (
                                  <>
                                    <Tooltip title="Save description">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        aria-label={`save description of ${c.name}`}
                                        onClick={() => {
                                          void handleConnectionDescription(c.id, editingConnection.text)
                                          setEditingConnection(null)
                                        }}
                                      >
                                        <CheckIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cancel">
                                      <IconButton
                                        size="small"
                                        aria-label="cancel editing description"
                                        onClick={() => setEditingConnection(null)}
                                      >
                                        <CloseIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                ) : (
                                  <Tooltip title="Edit description">
                                    <IconButton
                                      size="small"
                                      aria-label={`edit description of ${c.name}`}
                                      onClick={() => setEditingConnection({ id: c.id, text: c.description })}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Paper>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </Stack>
            </>
          )}
          {view === 'dashboard' && (
            <>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Dashboard
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Overview of your packages, releases and environments.
              </Typography>

              {otherSourceTotal > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Packages from non-Development connections</AlertTitle>
                  {otherSourceTotal} {otherSourceTotal === 1 ? 'package was' : 'packages were'} sent via the webhook
                  from connections that are not a defined Development connection. They are counted here but are not
                  assignable to a release on the Packages page.
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {Object.entries(otherSourceCounts).map(([source, count]) => (
                      <Chip key={source} size="small" variant="outlined" label={`${source} (${count})`} />
                    ))}
                  </Box>
                </Alert>
              )}

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  mb: 3,
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                }}
              >
                {stats.map((st) => (
                  <Card key={st.label}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: st.color }}>{st.icon}</Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
                          {st.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {st.label}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gap: 3,
                  alignItems: 'start',
                  gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
                }}
              >
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                      <RocketLaunchIcon color="primary" />
                      <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                        Active releases
                      </Typography>
                      <Chip size="small" label={releases.filter((r) => r.status === 2).length} />
                    </Stack>
                    <Stack spacing={2}>
                      {releases.filter((r) => r.status === 2).length === 0 && (
                        <Alert severity="info" variant="outlined">
                          No active releases.
                        </Alert>
                      )}
                      {releases
                        .filter((r) => r.status === 2)
                        .map((r) => {
                          const progress = releaseProgress(r)
                          return (
                            <Box
                              key={r.id}
                              title={isMonitored(r) ? MONITOR_HINT : undefined}
                              sx={isMonitored(r) ? { bgcolor: MONITOR_COLOR, borderRadius: 1, p: 1, m: -1 } : undefined}
                            >
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Typography variant="subtitle2" noWrap sx={{ flexGrow: 1 }}>
                                  {r.name}
                                </Typography>
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  icon={<Inventory2Icon />}
                                  label={packages.filter((p) => p.releaseId === r.id).length}
                                />
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {r.startDate ?? '—'} → {r.endDate ?? '—'}
                              </Typography>
                              {progress !== null && (
                                <LinearProgress
                                  variant="determinate"
                                  value={progress}
                                  sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                                />
                              )}
                            </Box>
                          )
                        })}
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                      <Inventory2Icon color="primary" />
                      <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                        Latest packages
                      </Typography>
                      <Chip size="small" label={packages.length} />
                    </Stack>
                    <Stack spacing={1}>
                      {packages.length === 0 && (
                        <Alert severity="info" variant="outlined">
                          No packages received yet.
                        </Alert>
                      )}
                      {packages.slice(0, 6).map((p) => {
                        const release = releases.find((r) => r.id === p.releaseId)
                        return (
                          <Stack key={p.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography variant="subtitle2" noWrap>
                                {p.packageName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap component="div">
                                {p.source} · {formatDateTime(p.receivedAt)}
                              </Typography>
                            </Box>
                            <Chip size="small" variant="outlined" label={p.version} />
                            <Chip
                              size="small"
                              color={release ? 'primary' : 'default'}
                              label={release ? release.name : 'Unassigned'}
                              sx={{ maxWidth: 140 }}
                            />
                          </Stack>
                        )
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                    <DnsIcon color="primary" />
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                      Environments
                    </Typography>
                    <Chip size="small" label={`${connections.length} connections`} />
                  </Stack>
                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                    {ENVIRONMENTS.map((env) => (
                      <Paper key={env.id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: env.color }}>{env.icon}</Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
                            {connections.filter((c) => c.environment === env.id).length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {env.label} connections
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </>
          )}
          {view === 'packages' && (
            <>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Packages
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                All packages received via the webhook, from every source. Packages from a Development connection can be
                assigned to a release that is not closed.
              </Typography>

              <Card>
                <CardContent>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                    <Inventory2Icon color="primary" />
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                      All packages
                    </Typography>
                    <Chip size="small" label={packages.length} />
                  </Stack>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search packages"
                    value={packageSearch}
                    onChange={(e) => setPackageSearch(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ mb: 2 }}
                  />
                  {visiblePackages.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                      {packages.length === 0 ? 'No packages received yet.' : 'No packages match your search.'}
                    </Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Package</TableCell>
                            <TableCell>Version</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Received</TableCell>
                            <TableCell sx={{ minWidth: 200 }}>Release</TableCell>
                            <TableCell align="right" />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visiblePackages.map((p) => {
                            const isDevelopment = developmentSources.has(p.source.trim().toLowerCase())
                            const current = releases.find((r) => r.id === p.releaseId)
                            const locked = current?.status === 3
                            return (
                              <TableRow key={p.id} hover>
                                <TableCell sx={{ fontWeight: 500 }}>{p.packageName}</TableCell>
                                <TableCell>
                                  <Chip size="small" variant="outlined" label={p.version} />
                                </TableCell>
                                <TableCell>
                                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                    <span>{p.source}</span>
                                    <Tooltip
                                      title={
                                        isDevelopment
                                          ? 'From a defined Development connection'
                                          : 'Not from a defined Development connection: cannot be assigned to a release'
                                      }
                                    >
                                      <Chip
                                        size="small"
                                        color={isDevelopment ? 'success' : 'default'}
                                        variant={isDevelopment ? 'filled' : 'outlined'}
                                        label={isDevelopment ? 'Development' : 'Other'}
                                      />
                                    </Tooltip>
                                  </Stack>
                                </TableCell>
                                <TableCell>{formatDateTime(p.receivedAt)}</TableCell>
                                <TableCell>
                                  <Select
                                    size="small"
                                    fullWidth
                                    displayEmpty
                                    value={p.releaseId ?? ''}
                                    disabled={locked || (!isDevelopment && p.releaseId === null)}
                                    onChange={(e) => void movePackage(p.id, e.target.value ? Number(e.target.value) : null)}
                                    inputProps={{ 'aria-label': `release of ${p.packageName} ${p.version}` }}
                                  >
                                    <MenuItem value="">
                                      <em>Unassigned</em>
                                    </MenuItem>
                                    {releases
                                      .filter((r) => r.status !== 3 || r.id === p.releaseId)
                                      .map((r) => (
                                        <MenuItem key={r.id} value={r.id}>
                                          {r.name}
                                        </MenuItem>
                                      ))}
                                  </Select>
                                </TableCell>
                                <TableCell align="right">
                                  <Tooltip title={current ? 'Assigned to a release: unassign it first' : 'Delete package'}>
                                    <span>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        disabled={p.releaseId !== null}
                                        aria-label={`delete ${p.packageName} ${p.version}`}
                                        onClick={() => setPackageToDelete(p)}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </>
          )}
          {view === 'releases' && (
            <>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Releases
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Plan and track releases. Click a release for its details and activity log; assign packages on the
                Packages page. Closed releases are locked.
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
                <RocketLaunchIcon color="primary" />
                <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                  All releases
                </Typography>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={releaseFilter}
                  onChange={(_, v) => v !== null && setReleaseFilter(v)}
                  aria-label="filter releases by status"
                >
                  <ToggleButton value="all">All</ToggleButton>
                  {RELEASE_STATUSES.map((st) => (
                    <ToggleButton key={st.value} value={st.value}>
                      {st.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setReleaseError(null)
                    setReleaseDialogOpen(true)
                  }}
                >
                  New release
                </Button>
              </Stack>

              {visibleReleases.length === 0 && (
                <Alert severity="info" variant="outlined">
                  {releases.length === 0
                    ? 'No releases yet. Create one with "New release".'
                    : 'No releases with this status.'}
                </Alert>
              )}

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
                }}
              >
                {visibleReleases.map((r) => {
                  const inRelease = packages.filter((p) => p.releaseId === r.id)
                  const open = r.status !== 3
                  const statusInfo = RELEASE_STATUSES.find((st) => st.value === r.status)!
                  const progress = releaseProgress(r)
                  return (
                    <Card
                      key={r.id}
                      onClick={(e) => openReleaseDetails(e, r.id)}
                      sx={{
                        cursor: 'pointer',
                        borderTop: 4,
                        borderTopColor: isMonitored(r)
                          ? MONITOR_BORDER
                          : r.status === 2 ? 'success.main' : r.status === 1 ? 'info.main' : 'grey.400',
                        opacity: open ? 1 : 0.85,
                        ...(isMonitored(r) && { bgcolor: MONITOR_COLOR }),
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="h6" component="h3" noWrap sx={{ flexGrow: 1 }}>
                            {r.name}
                          </Typography>
                          {isMonitored(r) && (
                            <Tooltip title={`${MONITOR_HINT}: set an end date`}>
                              <Chip size="small" icon={<WarningAmberIcon />} label="No end date" />
                            </Tooltip>
                          )}
                          {!open && (
                            <Tooltip title="Closed: packages can no longer be added or removed">
                              <LockIcon fontSize="small" color="action" />
                            </Tooltip>
                          )}
                          {!open && (
                            <Tooltip title="Delete release">
                              <IconButton
                                size="small"
                                color="error"
                                aria-label={`delete release ${r.name}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setReleaseToDelete({ id: r.id, name: r.name })
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Select
                            size="small"
                            value={r.status}
                            onChange={(e) => handleReleaseStatus(r.id, Number(e.target.value))}
                            inputProps={{ 'aria-label': `status of ${r.name}` }}
                            renderValue={() => <Chip size="small" color={statusInfo.color} label={statusInfo.label} />}
                          >
                            {RELEASE_STATUSES.map((st) => (
                              <MenuItem key={st.value} value={st.value}>
                                <Chip size="small" color={st.color} label={st.label} />
                              </MenuItem>
                            ))}
                          </Select>
                        </Stack>
                        {/* Only editable while the release is planned. */}
                        {editingDescription?.id === r.id && r.status === 1 ? (
                          <Stack direction="row" spacing={0.5} sx={{ mb: 2, alignItems: 'flex-start' }}>
                            <TextField
                              autoFocus
                              fullWidth
                              multiline
                              size="small"
                              label="Description"
                              value={editingDescription.text}
                              onChange={(e) => setEditingDescription({ id: r.id, text: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') setEditingDescription(null)
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                  void handleReleaseDescription(r.id, editingDescription.text)
                                  setEditingDescription(null)
                                }
                              }}
                            />
                            <Tooltip title="Save description">
                              <IconButton
                                color="primary"
                                aria-label={`save description of ${r.name}`}
                                onClick={() => {
                                  void handleReleaseDescription(r.id, editingDescription.text)
                                  setEditingDescription(null)
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton aria-label="cancel editing description" onClick={() => setEditingDescription(null)}>
                                <CloseIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        ) : (
                          <Stack direction="row" spacing={0.5} sx={{ mb: 2, alignItems: 'flex-start' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, minHeight: 20, whiteSpace: 'pre-wrap' }}>
                              {r.description || 'No description'}
                            </Typography>
                            <Tooltip title={r.status === 1 ? 'Edit description' : 'The description can only be edited while the release is planned'}>
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={r.status !== 1}
                                  aria-label={`edit description of ${r.name}`}
                                  onClick={() => setEditingDescription({ id: r.id, text: r.description })}
                                  sx={{ mt: -0.5 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        )}

                        <Stack direction="row" spacing={1.5} sx={{ mb: 1 }}>
                          <TextField
                            type="date"
                            size="small"
                            label="Start"
                            fullWidth
                            value={r.startDate ?? ''}
                            onChange={(e) => handleReleaseDates(r, { startDate: e.target.value || null })}
                            slotProps={{
                              inputLabel: { shrink: true },
                              htmlInput: { max: r.endDate ?? undefined },
                            }}
                          />
                          <TextField
                            type="date"
                            size="small"
                            label="End"
                            fullWidth
                            value={r.endDate ?? ''}
                            onChange={(e) => handleReleaseDates(r, { endDate: e.target.value || null })}
                            slotProps={{
                              inputLabel: { shrink: true },
                              htmlInput: { min: r.startDate ?? undefined },
                            }}
                          />
                        </Stack>
                        {progress !== null && (
                          <Tooltip title={`${Math.round(progress)}% of the release period has elapsed`}>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, mb: 1 }} />
                          </Tooltip>
                        )}

                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="overline" color="text.secondary">
                          Packages ({inRelease.length})
                        </Typography>
                        <Box
                          sx={{
                            mt: 0.5,
                            p: 1.5,
                            minHeight: 56,
                            border: '1px dashed',
                            borderColor: 'divider',
                            borderRadius: 1,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            alignItems: 'center',
                          }}
                        >
                          {inRelease.length === 0 && (
                            <Typography variant="body2" color="text.disabled">
                              {open ? 'No packages. Assign them on the Packages page.' : 'No packages'}
                            </Typography>
                          )}
                          {inRelease.map((p) => (
                            <Chip
                              key={p.id}
                              icon={<Inventory2Icon />}
                              variant="outlined"
                              label={`${p.packageName} ${p.version}`}
                              title={`Source: ${p.source}`}
                              onDelete={open ? () => void movePackage(p.id, null) : undefined}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  )
                })}
              </Box>
            </>
          )}
        </Container>
      </Box>
      </Box>
      </Box>

      <Dialog open={packageToDelete !== null} onClose={() => setPackageToDelete(null)}>
        <DialogTitle>Delete package?</DialogTitle>
        <DialogContent>
          <Typography>
            {packageToDelete?.packageName} {packageToDelete?.version} ({packageToDelete?.source}) will be permanently
            deleted. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPackageToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => packageToDelete && void deletePackage(packageToDelete)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={releaseToDelete !== null} onClose={() => setReleaseToDelete(null)}>
        <DialogTitle>Delete release?</DialogTitle>
        <DialogContent>
          <Typography>
            Release {releaseToDelete?.name} and its log will be permanently deleted. Its packages stay available
            as unassigned. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReleaseToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => releaseToDelete && void deleteRelease(releaseToDelete)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(moveError)}
        autoHideDuration={6000}
        onClose={() => setMoveError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setMoveError(null)}>
          {moveError}
        </Alert>
      </Snackbar>

      {(() => {
        const r = releases.find((x) => x.id === detailReleaseId)
        const statusInfo = RELEASE_STATUSES.find((st) => st.value === r?.status)
        const inRelease = packages.filter((p) => p.releaseId === detailReleaseId)
        return (
          <Dialog open={r !== undefined} onClose={() => setDetailReleaseId(null)} fullWidth maxWidth="md" scroll="paper">
            {r && (
              <>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <RocketLaunchIcon color="primary" />
                  <Box component="span" sx={{ flexGrow: 1 }}>
                    {r.name}
                  </Box>
                  {statusInfo && <Chip size="small" color={statusInfo.color} label={statusInfo.label} />}
                  <IconButton aria-label="close details" onClick={() => setDetailReleaseId(null)}>
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                  <Typography variant="overline" color="text.secondary">
                    Description
                  </Typography>
                  <Typography sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{r.description || 'No description'}</Typography>

                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, mb: 2 }}>
                    <Box>
                      <Typography variant="overline" color="text.secondary">
                        Start date
                      </Typography>
                      <Typography>{r.startDate ?? '—'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="overline" color="text.secondary">
                        End date
                      </Typography>
                      <Typography>{r.endDate ?? '—'}</Typography>
                    </Box>
                  </Box>

                  <Typography variant="overline" color="text.secondary">
                    Packages ({inRelease.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, mt: 0.5 }}>
                    {inRelease.length === 0 && <Typography color="text.disabled">No packages</Typography>}
                    {inRelease.map((p) => (
                      <Chip
                        key={p.id}
                        icon={<Inventory2Icon />}
                        variant="outlined"
                        label={`${p.packageName} ${p.version} (${p.source})`}
                      />
                    ))}
                  </Box>

                  <Divider sx={{ mb: 1.5 }} />
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <HistoryIcon color="primary" />
                    <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                      Activity log
                    </Typography>
                    <Chip size="small" label={releaseLog.length} />
                  </Stack>
                  {releaseLog.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                      No activity recorded yet.
                    </Alert>
                  ) : (
                    <List dense disablePadding>
                      {releaseLog.map((entry) => (
                        <ListItem key={entry.id} divider disableGutters>
                          <ListItemText
                            primary={entry.message}
                            secondary={`${formatDateTime(entry.loggedAt)} · ${entry.event}`}
                            slotProps={{ primary: { sx: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' } } }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setDetailReleaseId(null)}>Close</Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        )
      })()}

      <Dialog
        open={testCaseDialog !== null}
        onClose={() => setTestCaseDialog(null)}
        fullWidth
        maxWidth="md"
        component="form"
        onSubmit={handleCreateTestCase}
      >
        <DialogTitle>
          New test case for {testCaseDialog?.packageName} {testCaseDialog?.version}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {testCaseError && <Alert severity="error">{testCaseError}</Alert>}
            <TextField
              autoFocus
              required
              label="Name"
              value={testCaseForm.name}
              onChange={(e) => setTestCaseForm({ ...testCaseForm, name: e.target.value })}
            />
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={testCaseForm.description}
              onChange={(e) => setTestCaseForm({ ...testCaseForm, description: e.target.value })}
            />

            <Divider />
            <Typography variant="subtitle2">Cucumber steps</Typography>
            {cucumberSteps.length === 0 && (
              <Alert severity="info" variant="outlined">
                No step definitions found in input/cucumber.conf. The test case is saved without a scenario.
              </Alert>
            )}
            {scenarioSteps.map((st, index) => {
              const def = cucumberSteps.find((d) => d.id === st.stepId)
              return (
                <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Autocomplete
                      fullWidth
                      size="small"
                      options={cucumberSteps}
                      groupBy={(o) => o.keyword}
                      getOptionLabel={(o) => o.label}
                      value={def ?? null}
                      onChange={(_, v) => updateScenarioStep(index, { stepId: v?.id ?? null, values: {} })}
                      renderInput={(params) => <TextField {...params} label={`Step ${index + 1}`} />}
                    />
                    <IconButton
                      aria-label={`remove step ${index + 1}`}
                      onClick={() => setScenarioSteps((prev) => prev.filter((_, k) => k !== index))}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  {def && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mt: 1.5 }}>
                      {renderStepNodes(def.segments, 'r', st, index)}
                    </Box>
                  )}
                </Paper>
              )
            })}
            <Box>
              <Button
                startIcon={<AddIcon />}
                disabled={cucumberSteps.length === 0}
                onClick={() => setScenarioSteps((prev) => [...prev, { stepId: null, values: {} }])}
              >
                Add step
              </Button>
            </Box>
            {scenarioSteps.length > 0 && scenarioReady && testCaseDialog && (
              <Typography
                component="pre"
                variant="body2"
                sx={{ m: 0, p: 1.5, borderRadius: 1, bgcolor: 'action.hover', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
              >
                {buildScenario(testCaseDialog.packageName, testCaseDialog.version, testCaseForm.name, scenarioSteps, cucumberSteps)}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestCaseDialog(null)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!testCaseForm.name.trim() || !scenarioReady}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewTestCase !== null} onClose={() => setViewTestCase(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          {viewTestCase?.name} ({viewTestCase?.packageName} {viewTestCase?.version})
        </DialogTitle>
        <DialogContent dividers>
          {viewTestCase?.description && <Typography sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{viewTestCase.description}</Typography>}
          <Typography
            component="pre"
            variant="body2"
            sx={{ m: 0, p: 1.5, borderRadius: 1, bgcolor: 'action.hover', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
          >
            {viewTestCase?.scenario}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewTestCase(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={connectionDialog !== null}
        onClose={() => setConnectionDialog(null)}
        fullWidth
        maxWidth="sm"
        component="form"
        onSubmit={handleCreateConnection}
      >
        <DialogTitle>
          New {ENVIRONMENTS.find((e) => e.id === connectionDialog)?.label} connection
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {connectionError && <Alert severity="error">{connectionError}</Alert>}
            <TextField
              label="Name"
              required
              autoFocus
              value={connectionForm.name}
              onChange={(e) => setConnectionForm({ ...connectionForm, name: e.target.value })}
            />
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={connectionForm.description}
              onChange={(e) => setConnectionForm({ ...connectionForm, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectionDialog(null)}>Cancel</Button>
          <Button type="submit" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={releaseDialogOpen}
        onClose={() => setReleaseDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        component="form"
        onSubmit={handleCreateRelease}
      >
        <DialogTitle>New release</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {releaseError && <Alert severity="error">{releaseError}</Alert>}
            <TextField
              label="Name"
              required
              autoFocus
              value={releaseForm.name}
              onChange={(e) => setReleaseForm({ ...releaseForm, name: e.target.value })}
            />
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={releaseForm.description}
              onChange={(e) => setReleaseForm({ ...releaseForm, description: e.target.value })}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Start date"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={releaseForm.startDate}
                onChange={(e) => setReleaseForm({ ...releaseForm, startDate: e.target.value })}
              />
              <TextField
                label="End date"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={releaseForm.endDate}
                onChange={(e) => setReleaseForm({ ...releaseForm, endDate: e.target.value })}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReleaseDialogOpen(false)}>Cancel</Button>
          <Button type="submit" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}

export default App
