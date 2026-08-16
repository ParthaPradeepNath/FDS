import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { Button } from '@/components/ui/stateful-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, ShieldCheck, User } from 'lucide-react'
import Logo from '../components/Logo'

const ROLE_ITEMS = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
]

export default function Login() {
  const { login, register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || (isAuthenticated ? '/' : '/feedback/new')

  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, navigate, from])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value })
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(registerForm.name, registerForm.email, registerForm.password, registerForm.role)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  const fieldClasses = 'h-10 bg-background'

  return (
    <div className="mx-auto grid w-full max-w-md place-items-center py-8">
      <div className="w-full">
        <div className="mb-6 text-center">
          <Logo className="mx-auto mb-3 size-14" />
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to One Hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account or create a new one.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <Card>
            <CardHeader className="gap-3 pb-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
              <div>
                <CardTitle className="text-lg">
                  {tab === 'register' ? 'Create an account' : 'Welcome back'}
                </CardTitle>
                <CardDescription className="mt-0.5">
                  {tab === 'register'
                    ? 'Register quickly — no approval needed.'
                    : 'Log in to continue to your dashboard.'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}

              <TabsContent value="login" className="m-0">
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={fieldClasses}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Your password"
                      className={fieldClasses}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    onClick={handleLogin}
                    className="mt-1 bg-primary text-primary-foreground hover:ring-primary"
                  >
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="m-0">
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={registerForm.name}
                      onChange={handleRegisterChange}
                      placeholder="Jane Doe"
                      className={fieldClasses}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      placeholder="you@example.com"
                      className={fieldClasses}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      placeholder="At least 6 characters"
                      minLength={6}
                      className={fieldClasses}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="reg-role">Register as</Label>
                    <Select
                      items={ROLE_ITEMS}
                      value={registerForm.role}
                      onValueChange={(role) => setRegisterForm((f) => ({ ...f, role }))}
                    >
                      <SelectTrigger id="reg-role" className="w-full bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            <span className="flex items-center gap-1.5">
                              {item.value === 'admin' ? (
                                <ShieldCheck className="size-3.5" />
                              ) : (
                                <User className="size-3.5" />
                              )}
                              {item.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    onClick={handleRegister}
                    className="mt-1 bg-primary text-primary-foreground hover:ring-primary"
                  >
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Pick <span className="font-medium">Admin</span> during registration to access dashboards
          and reports.
        </p>
      </div>
    </div>
  )
}
