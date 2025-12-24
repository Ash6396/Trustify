import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useWallet } from '../context/WalletContext'
import { Menu, X, Sun, Moon, LogOut, User as UserIcon, Wallet, ChevronDown, LayoutDashboard, Send, Vote } from 'lucide-react'

function NavItem({ to, label, icon: Icon, onClick }: { to: string; label: string; icon?: React.ElementType; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 
        ${isActive
          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white shadow-sm ring-1 ring-primary/20'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`
      }
    >
      {Icon && <Icon size={18} />}
      {label}
    </NavLink>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { toggleTheme, theme } = useTheme()
  const { connected, account, connect, disconnect } = useWallet()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const shortAccount = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : null

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b 
      ${scrolled
          ? 'border-border/50 bg-background/80 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-background/60 py-2'
          : 'border-transparent bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-50">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <span className="font-heading text-lg">T</span>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              TRUSTIFY
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-background/50 backdrop-blur-sm px-2 py-1.5 rounded-full border border-border/40 shadow-sm">
            <NavItem to="/" label="Home" />
            <NavItem to="/campaigns" label="Explore" />
            {user && (
              <>
                <NavItem to="/dashboard" label="Dashboard" />
                <NavItem to="/dao" label="DAO" />
              </>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={connected ? disconnect : connect}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border
                  ${connected
                    ? 'bg-accent/50 text-foreground border-border hover:bg-accent'
                    : 'bg-primary text-primary-foreground border-transparent hover:bg-primary/90 shadow-lg shadow-primary/20 hover:-translate-y-0.5'
                  }`}
              >
                <Wallet size={16} />
                {connected ? shortAccount : 'Connect Wallet'}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-border/50 hover:bg-accent transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-background group-hover:ring-border transition-all">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>

                  {isProfileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-popover text-popover-foreground border border-border p-2 shadow-xl shadow-black/5 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="px-3 py-3 border-b border-border/50 mb-2 bg-accent/30 rounded-t-xl -mx-2 -mt-2">
                          <p className="font-heading font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>

                        <div className="space-y-1">
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            <UserIcon size={16} className="text-muted-foreground" />
                            Profile
                          </Link>

                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              <LayoutDashboard size={16} className="text-muted-foreground" />
                              Admin Dashboard
                            </Link>
                          )}

                          {user.role === 'creator' && (
                            <Link
                              to="/create"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              <Send size={16} className="text-muted-foreground" />
                              Create Campaign
                            </Link>
                          )}
                        </div>

                        <div className="my-2 border-t border-border/50" />

                        <button
                          onClick={() => {
                            logout()
                            navigate('/')
                            setIsProfileMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-foreground/10 hover:shadow-foreground/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-40 bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-10 duration-300 flex flex-col">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <NavItem to="/" label="Home" />
              <NavItem to="/campaigns" label="Explore Campaigns" />

              {user && (
                <>
                  <NavItem to="/dashboard" label="Dashboard" />
                  <NavItem to="/dao" label="DAO Voting" isMobile />
                  <NavItem to="/profile" label="Profile" icon={UserIcon} />
                  {user.role === 'admin' && <NavItem to="/admin" label="Admin Dashboard" icon={LayoutDashboard} />}
                  {user.role === 'creator' && <NavItem to="/create" label="Create Campaign" icon={Send} />}
                </>
              )}
            </div>

            <div className="pt-6 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 text-foreground text-sm font-medium hover:bg-accent transition-colors"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>

              <button
                onClick={connected ? disconnect : connect}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent/50 border border-border text-foreground font-medium hover:bg-accent transition-colors"
              >
                <Wallet size={18} />
                {connected ? shortAccount : 'Connect Wallet'}
              </button>

              {user ? (
                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors font-medium"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="flex items-center justify-center px-4 py-3 rounded-xl bg-accent text-foreground font-medium hover:bg-accent/80 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center justify-center px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

