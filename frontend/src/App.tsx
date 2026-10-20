import {
  useCallback,
  useEffect,
  useState,
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
  Divider,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
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
  Typography,
  createTheme,
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import RefreshIcon from '@mui/icons-material/Refresh'
import Inventory2Icon from '@mui/icons-material/Inventory2'
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
  receivedAt: string
  packageName: string
  source: string
  version: string
}

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

  useEffect(() => {
    fetchStatus()
    fetchPackages()
    const id = setInterval(() => {
      fetchStatus()
      fetchPackages()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchStatus, fetchPackages])

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
            <Chip size="small" label={packages.length} />
          </Stack>
          <TableContainer component={Paper}>
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
                {packages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                      No packages received yet.
                    </TableCell>
                  </TableRow>
                )}
                {packages.map((p, i) => (
                  <TableRow key={`${p.receivedAt}-${i}`} hover>
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
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
