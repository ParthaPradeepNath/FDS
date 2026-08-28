import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, LayoutDashboard, LogOut, MessageSquareText } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { cn } from '@/lib/utils'

const links = (isAdmin) => {
  const items = [{ to: '/', label: 'Home' }]
  if (isAdmin) {
    items.push(
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/feedback', label: 'All Feedback' },
      { to: '/admin/reports', label: 'Reports' },
    )
  } else {
    items.push(
      { to: '/feedback/new', label: 'Give Feedback' },
      { to: '/my-feedback', label: 'My Feedback' },
    )
  }
  return items
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar-glass">
      <div className="relative flex h-[58px] items-center justify-between gap-2 pl-5 pr-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <Logo className="size-7" />
          <span className="text-base font-semibold tracking-tight">One Hub</span>
        </Link>

        <nav className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap md:flex">
          {links(isAdmin).map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'text-foreground/75',
                  isActive && 'bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'h-9 gap-2 px-1.5 outline-none data-open:bg-muted',
                )}
              >
                <Avatar size="sm" className="ring-ring ring-2">
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-28 truncate text-sm sm:inline">{user.name}</span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{user.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    render={
                      <Link to={isAdmin ? '/admin' : '/my-feedback'} />
                    }
                  >
                    {isAdmin ? <LayoutDashboard /> : <MessageSquareText />}
                    {isAdmin ? 'Open dashboard' : 'My feedback'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LogOut />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className={buttonVariants({ size: 'sm' })}>
              Login
            </Link>
          )}
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-black/5 px-3 pb-2.5 dark:border-white/10 md:hidden">
        {links(isAdmin).map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'shrink-0 text-foreground/75',
                isActive && 'bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
