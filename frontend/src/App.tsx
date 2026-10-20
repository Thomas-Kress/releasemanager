import {
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
  Card,
  CardContent,
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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import LockIcon from '@mui/icons-material/Lock'
import SearchIcon from '@mui/icons-material/Search'
import HistoryIcon from '@mui/icons-material/History'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
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
  { id: 'releases', label: 'Packages and Releases', icon: <Inventory2Icon /> },
  { id: 'environments', label: 'Environments', icon: <DnsIcon /> },
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
  const [dragOverRelease, setDragOverRelease] = useState<number | 'packages' | null>(null)
  const [moveError, setMoveError] = useState<string | null>(null)
  const [releaseError, setReleaseError] = useState<string | null>(null)
  // Below the md breakpoint the sidebar shows icons only, so they need tooltips.
  const compactSidebar = useMediaQuery(theme.breakpoints.down('md'))
  const [connections, setConnections] = useState<ConnectionRecord[]>([])
  const [connectionDialog, setConnectionDialog] = useState<EnvironmentId | null>(null)
  const [connectionForm, setConnectionForm] = useState({ name: '', description: '' })
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [editingDescription, setEditingDescription] = useState<{ id: number; text: string } | null>(null)
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

  const handleReleaseDescription = async (id: number, description: string) => {
    setReleases((prev) => prev.map((r) => (r.id === id ? { ...r, description: description.trim() } : r)))
    try {
      await fetch(`/api/releases/${id}/description`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
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
    fetchConnections()
    const id = setInterval(() => {
      fetchStatus()
      fetchPackages()
      fetchReleases()
      fetchConnections()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchStatus, fetchPackages, fetchReleases, fetchConnections])

  const unassignedPackages = packages.filter((p) => p.releaseId === null)
  const search = packageSearch.trim().toLowerCase()
  const visiblePackages = unassignedPackages.filter(
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
                                  <Typography variant="caption" color="text.secondary" noWrap component="div">
                                    {c.description || 'No description'}
                                  </Typography>
                                </Box>
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
                            <Box key={r.id}>
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
          {view === 'releases' && (
            <>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Packages and Releases
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Drag a package from the left onto a release to plan it. Closed releases are locked.
              </Typography>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              alignItems: 'start',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(320px, 4fr) 8fr' },
            }}
          >
            {/* Packages */}
            <Card
              {...dropTarget('packages', null, true)}
              sx={{
                position: { md: 'sticky' },
                top: { md: 80 },
                ...(dragOverRelease === 'packages' && { outline: '2px dashed', outlineColor: 'primary.main' }),
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                  <Inventory2Icon color="primary" />
                  <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                    Packages
                  </Typography>
                  <Chip size="small" label={unassignedPackages.length} />
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
                <Stack spacing={1} sx={{ maxHeight: { md: 'calc(100vh - 320px)' }, overflowY: 'auto' }}>
                  {visiblePackages.length === 0 && (
                    <Alert severity="info" variant="outlined">
                      {unassignedPackages.length === 0
                        ? 'No unassigned packages. New packages arrive through the webhook.'
                        : 'No packages match your search.'}
                    </Alert>
                  )}
                  {visiblePackages.map((p) => (
                    <Paper
                      key={p.id}
                      variant="outlined"
                      draggable
                      onDragStart={dragPackage(p.id)}
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'grab',
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                      }}
                    >
                      <DragIndicatorIcon fontSize="small" color="action" />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap>
                          {p.packageName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap component="div">
                          {p.source} · {formatDateTime(p.receivedAt)}
                        </Typography>
                      </Box>
                      <Chip size="small" variant="outlined" label={p.version} />
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Releases */}
            <Box>
              <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
                <RocketLaunchIcon color="primary" />
                <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                  Releases
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
                  gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
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
                      {...dropTarget(r.id, r.id, open)}
                      onClick={(e) => openReleaseDetails(e, r.id)}
                      sx={{
                        cursor: 'pointer',
                        borderTop: 4,
                        borderTopColor: r.status === 2 ? 'success.main' : r.status === 1 ? 'info.main' : 'grey.400',
                        opacity: open ? 1 : 0.85,
                        ...(dragOverRelease === r.id && {
                          outline: '2px dashed',
                          outlineColor: 'primary.main',
                          bgcolor: 'action.hover',
                        }),
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="h6" component="h3" noWrap sx={{ flexGrow: 1 }}>
                            {r.name}
                          </Typography>
                          {!open && (
                            <Tooltip title="Closed: packages can no longer be added or removed">
                              <LockIcon fontSize="small" color="action" />
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
                        {/* Editable in every status, including closed. */}
                        {editingDescription?.id === r.id ? (
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
                            <Tooltip title="Edit description">
                              <IconButton
                                size="small"
                                aria-label={`edit description of ${r.name}`}
                                onClick={() => setEditingDescription({ id: r.id, text: r.description })}
                                sx={{ mt: -0.5 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
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
                              {open ? 'Drop packages here' : 'No packages'}
                            </Typography>
                          )}
                          {inRelease.map((p) => (
                            <Chip
                              key={p.id}
                              icon={<Inventory2Icon />}
                              variant="outlined"
                              label={`${p.packageName} ${p.version}`}
                              title={`Source: ${p.source}`}
                              draggable={open}
                              onDragStart={dragPackage(p.id)}
                              onDelete={open ? () => void movePackage(p.id, null) : undefined}
                              sx={open ? { cursor: 'grab' } : undefined}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  )
                })}
              </Box>
            </Box>
          </Box>
            </>
          )}
        </Container>
      </Box>
      </Box>
      </Box>

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
