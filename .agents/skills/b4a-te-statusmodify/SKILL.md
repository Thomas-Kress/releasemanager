---
name: b4a-te-statusmodify
description: "The module can set the state of tasks. This should just be used if all other possibilities do not work as it can influence with the processing. Uses the b4A / best4Automic ReST API's te.StatusModify module. Use when the user wants to modify state task in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Task: Modify state

The module can set the state of tasks. This should just be used if all other possibilities do not work as it can influence with the processing. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "te.StatusModify",
  "options": {
    "connection": "<connection>"
  }
}
```

Use the user-provided connection, or `$B4A_DEFAULT_CONNECTION` when none is given.

### Options

Add any of these to the `options` object when the user's request calls for them. All are optional; only add an option when it is actually needed.

| Option | Flag | Description |
|---|---|---|
| Test mode | `test-mode` | Activates a simulation mode |
| New Status | `state` | Defines the new status of the selected tasks. Possible values: In preparation (1300), Waiting for user input (1301), Operation not initialized (1310), Transferred (1510), Ready to transfer (before connection setup) (1520), Ready to transfer (1521), Ready for generation (1529), Ready to start (1530), To be notified (1531), Start initiated (1540), Under review (1541), Being notified (1542), Unknown (1543), Inconsistent (1544), Started (1545), Establishing connection (1546), Remote Task Manager inconsistent (1547), Active (1550), Transferring (1551), Notified (1552), Accepted (1553), Determining file volume (1554), Escalated (1556), Custom backup (1557), File-based backup (1558), Workflow blocked (1560), STOP - Automatic processing was stopped client-wide. (1561), STOP - Manual stop was set. (1562), STOP - Automatic processing was stopped. (1563), STOP - Queue processing was stopped. (1564), Send process finished (1565), Skipping - Timeout (1566), Skipping - Condition (1567), Skipping - manually inactive (1568), Sync is being skipped (1569), Skipping (1570), Cancellation initiated (1571), Generating (1572), Generated (1573), Post-processing (1574), Terminating (1575), Regenerating (1576), Searching files (1578), Searching reports (1579), Resolving variables (1580), Checking post-conditions (1581), Checking prompt values (1582), Looping (1583), Calculating ERT (1584), Custom rollback (1590), File-based rollback (1591), Agent group rollback (1592), Workflow rollback (1593), Alive (user view) (1599), ENDED_OK - ended normally. (1900), Acknowledged (1901), Queue processing finished (1902), Container ended (1903), ENDED_ROLLBACKED - task rolled back successfully (1904), Workflow rolled back successfully. (1905), ENDED_EMPTY - task empty (STOP NOMSG). (1910), ENDED_TRUNCATE - not everything transferred due to line limit. (1911), ENDED_EMPTY - nothing found. (1912), ENDED_ROLLBACK_EMPTY - no rollback defined (1913), ENDED_INACTIVE - due to the logical date condition of the external dependency. (1919), ENDED_INACTIVE - inactive today due to calendar. (1920), ENDED_INACTIVE - task not active per definition. (1921), ENDED_INACTIVE - task manually set to inactive. (1922), Deleted (1923), Unprocessed (1924), ENDED_INACTIVE_OBJECT - object inactive per definition. (1925), UNPROCESSED_IF - if branch not executed (1926), ENDED_SKIPPED - skipped due to a dependency clause. (1930), ENDED_SKIPPED - skipped due to a SYNC condition. (1931), ENDED_SKIPPED - schedule ended prematurely (1932), ENDED_SKIPPED - due to conditions (1933), ENDED_SKIPPED - manually skipped (1934), ENDED_TIMEOUT - not executed due to TIMEOUT (dependency clause). (1940), ENDED_TIMEOUT - start time exceeded. (1941), ENDED_TIMEOUT - ended prematurely. (1942), ENDED_TIMEOUT - period stopped (1944), Notification successful (1960), Operation successful (1970), Fulfilled (1997), SYNC check done (1999), Under internal review (1600), Waiting for rollback (1655), Waiting for external parameters (1665), Checking pre-conditions (1680), Waiting for user (1681), Waiting for variable resolution to continue (1682), Waiting for remote resource (1683), Waiting for queue slot (1684), Waiting for host for post-processing (1685), Waiting for the agent group container to start (1686), Waiting for parallel tasks of the agent group to finish (1687), Waiting for the host of an agent group (1688), Waiting for resource (max. file transfers exceeded) (1689), Waiting for external precondition (1690), Waiting for remote system (1691), Waiting for remote SYNC (1692), Waiting for manual release (1693), Waiting for resource (max. jobs exceeded) (1694), Waiting for restart time (1695), Waiting for host (1696), Waiting for SYNC (1697), Waiting for start time (1698), Alive (1699), Waiting for predecessor (1700), Sleeping (1701), Not yet notified (1702), Waiting for pre-conditions (1703), Checking pre-conditions (1704), Switching logging (1705), Waiting for parallel task(s) to finish (1709), Reserved (1710), Queued (1711), Dead (1799), ENDED_NOT_OK - cancelled (1800), ENDED_NOT_OK - cancelled due to the SYNC condition (1801), ENDED_JP_ABEND - not executed due to workflow abend (1802), ENDED_VANISHED - vanished (1810), ENDED_LOST - ended undefined (agent terminated prematurely) (1815), FAULT_OTHER - start not possible, other error. (1820), FAULT_NO_HOST - start not possible, the host is not reachable. (1821), FAULT_ALREADY_RUNNING - task is already running. (1822), FAULT_POST_PROCESSING - error in post-processing. (1823), FAULT_POST_CONDITION - error in the post-condition. (1824), FAULT_CUSTOM_BACKUP - error during custom backup (1825), FAULT_FILE_BACKUP - error during file-based backup (1826), FAULT_CUSTOM_ROLLBACK - error during custom rollback (1827), FAULT_FILE_ROLLBACK - error during file-based rollback (1828), FAULT_HOSTGROUP_ROLLBACK - error in agent group rollback (1829), FAULT_ROLLBACK - general rollback error (1830), ENDED_CANCEL - manual cancellation (1850), ENDED_JP_CANCEL - workflow ended by manual cancellation. (1851), Rejected (1852), Cancelled by queue (1853), Cancelled by container (1854), ENDED_ESCALATED - cancelled due to escalation (1856), Notification failed (1860), Violated (1897), Blocked (1898), Blocked state manually reset (1899) |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
