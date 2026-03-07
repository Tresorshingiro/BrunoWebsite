import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AdminProvider } from './context/AdminContext'
import { CartProvider } from './context/CartContext'
import { UserProvider } from './context/UserContext'

// Layout
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Home from './pages/Home'
import About from './pages/About'
import Books from './pages/Books'
import BookDetail from './pages/BookDetail'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Events from './pages/Events'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import Login from './pages/Login'

// Admin pages
import AdminLayout from './admin/AdminLayout'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import AdminBooks from './admin/AdminBooks'
import AdminBlog from './admin/AdminBlog'
import AdminEvents from './admin/AdminEvents'
import AdminContact from './admin/AdminContact'
import AdminOrders from './admin/AdminOrders'

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AdminProvider>
          <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#F5EDD6',
                border: '1px solid #2a2a2a',
              },
              success: { iconTheme: { primary: '#C9A84C', secondary: '#080808' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#080808' } },
            }}
          />
          <Routes>
            {/* Auth route (standalone) */}
            <Route path="/login" element={<Login />} />

            {/* Public routes — Layout uses <Outlet /> */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/books" element={<Books />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/events" element={<Events />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/checkout/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            </Route>

            {/* Admin routes — AdminLayout uses <Outlet /> and handles auth */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/login" replace />} />
              <Route path="login" element={<AdminLogin />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="messages" element={<AdminContact />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>
          </Routes>
        </CartProvider>
      </AdminProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

