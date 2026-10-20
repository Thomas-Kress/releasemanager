import {
  Fragment,
  useCallback,
  useEffect,
  useState,
  type DragEvent,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import {
  Alert,
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Select,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
} from '@mui/material'
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
  status: LoginStatus
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

interface TokenResponse {
  token: string
  expires_at: string | null
  username: string | null
}

const POLL_INTERVAL_MS = 5000

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
  },
})

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
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

function App() {
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
  const [dragOverRelease, setDragOverRelease] = useState<number | 'packages' | null>(null)
  const [moveError, setMoveError] = useState<string | null>(null)
  const [releaseError, setReleaseError] = useState<string | null>(null)
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

  // Drag & drop: a package row/chip carries its id; dropping on a release row
  // assigns it, dropping on the Packages table unassigns it. Closed releases refuse both.
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

  const dragPackage = (id: number) => (e: DragEvent) => {
    e.dataTransfer.setData('text/package-id', String(id))
    e.dataTransfer.effectAllowed = 'move'
  }

  const dropTarget = (key: number | 'packages', releaseId: number | null, enabled: boolean) => ({
    onDragOver: (e: DragEvent) => {
      if (!enabled || !e.dataTransfer.types.includes('text/package-id')) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverRelease(key)
    },
    onDragLeave: () => setDragOverRelease((cur) => (cur === key ? null : cur)),
    onDrop: (e: DragEvent) => {
      setDragOverRelease(null)
      const id = Number(e.dataTransfer.getData('text/package-id'))
      if (!enabled || !id) return
      e.preventDefault()
      void movePackage(id, releaseId)
    },
  })

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
    const id = setInterval(() => {
      fetchStatus()
      fetchPackages()
      fetchReleases()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchStatus, fetchPackages, fetchReleases])

  const unassignedPackages = packages.filter((p) => p.releaseId === null)

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

  const status: LoginStatus = data?.status ?? 'pending'
  const config = STATUS_CONFIG[status]
  const infoOpen = Boolean(anchorEl)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Release Manager
          </Typography>

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

          <Popover
            id="connection-info-popover"
            open={infoOpen}
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

      <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="lg">
          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
            <Inventory2Icon color="primary" />
            <Typography variant="h5" component="h2">
              Packages
            </Typography>
            <Chip size="small" label={unassignedPackages.length} />
          </Stack>
          {moveError && (
            <Alert severity="error" onClose={() => setMoveError(null)} sx={{ mb: 2 }}>
              {moveError}
            </Alert>
          )}
          <TableContainer
            component={Paper}
            {...dropTarget('packages', null, true)}
            sx={dragOverRelease === 'packages' ? { outline: '2px dashed', outlineColor: 'primary.main' } : undefined}
          >
            <Table size="small" aria-label="packages">
              <TableHead>
                <TableRow>
                  <TableCell>Package</TableCell>
                  <TableCell>Source (System-Client)</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Received</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unassignedPackages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                      No unassigned packages.
                    </TableCell>
                  </TableRow>
                )}
                {unassignedPackages.map((p) => (
                  <TableRow key={p.id} hover draggable onDragStart={dragPackage(p.id)} sx={{ cursor: 'grab' }}>
                    <TableCell>{p.packageName}</TableCell>
                    <TableCell>{p.source}</TableCell>
                    <TableCell>
                      <Chip size="small" variant="outlined" label={p.version} />
                    </TableCell>
                    <TableCell>{formatDateTime(p.receivedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" spacing={1} sx={{ mt: 5, mb: 2, alignItems: 'center' }}>
            <RocketLaunchIcon color="primary" />
            <Typography variant="h5" component="h2">
              Releases
            </Typography>
            <Chip size="small" label={releases.length} />
            <Tooltip title="New release">
              <IconButton
                color="primary"
                aria-label="add release"
                onClick={() => {
                  setReleaseError(null)
                  setReleaseDialogOpen(true)
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <TableContainer component={Paper}>
            <Table size="small" aria-label="releases">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {releases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                      No releases yet.
                    </TableCell>
                  </TableRow>
                )}
                {releases.map((r) => {
                  const inRelease = packages.filter((p) => p.releaseId === r.id)
                  const open = r.status !== 3
                  return (
                  <Fragment key={r.id}>
                  <TableRow
                    hover
                    {...dropTarget(r.id, r.id, open)}
                    sx={dragOverRelease === r.id ? { outline: '2px dashed', outlineColor: 'primary.main' } : undefined}
                  >
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>
                      <TextField
                        type="date"
                        size="small"
                        value={r.startDate ?? ''}
                        onChange={(e) => handleReleaseDates(r, { startDate: e.target.value || null })}
                        slotProps={{ htmlInput: { 'aria-label': `start date of ${r.name}`, max: r.endDate ?? undefined } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="date"
                        size="small"
                        value={r.endDate ?? ''}
                        onChange={(e) => handleReleaseDates(r, { endDate: e.target.value || null })}
                        slotProps={{ htmlInput: { 'aria-label': `end date of ${r.name}`, min: r.startDate ?? undefined } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={r.status}
                        onChange={(e) => handleReleaseStatus(r.id, Number(e.target.value))}
                        inputProps={{ 'aria-label': `status of ${r.name}` }}
                        sx={{ minWidth: 130 }}
                      >
                        {RELEASE_STATUSES.map((st) => (
                          <MenuItem key={st.value} value={st.value}>
                            <Chip size="small" color={st.color} label={st.label} />
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                  {inRelease.length > 0 && (
                    <TableRow {...dropTarget(r.id, r.id, open)}>
                      <TableCell colSpan={5} sx={{ py: 1, borderBottom: 0 }}>
                        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                          <Inventory2Icon fontSize="small" color="action" />
                          {inRelease.map((p) => (
                            <Chip
                              key={p.id}
                              size="small"
                              variant="outlined"
                              label={`${p.packageName} ${p.version} (${p.source})`}
                              draggable={open}
                              onDragStart={dragPackage(p.id)}
                              sx={open ? { cursor: 'grab' } : undefined}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                  </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

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
