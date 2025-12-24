import { renderProducts } from './pages/ProductsPage';
import { renderContact } from './pages/ContactPage';
import { renderBrands } from './pages/BrandsPage';
import { renderProductsAdmin } from './pages/ProductsAdminPage';
import { renderReviewsPage } from './pages/ReviewsPage';
import { renderLogin } from './pages/LoginPage';
import { renderRegister } from './pages/RegisterPage';
import { mountProfilePage } from './pages/ProfilePage';
import { mountChangePasswordPage } from './pages/ChangePasswordPage';
import { renderSupportPage } from './pages/SupportPage';
import { renderMySupportTicketsPage } from './pages/SupportTicketsPage';
import { renderSupportAdminPage } from './pages/SupportAdminPage';
import { renderWishlistPage } from './pages/WishlistPage';



type RouteKey =
  | '/' | '/proizvodi' | '/kontakt'
  | '/brendovi' | '/proizvodi-admin'
  | '/recenzije' | '/login' | '/register'
  | '/profil' | '/promjena-lozinke'
  | '/podrska' | '/moji-zahtjevi'
  | '/support-admin' | '/wishlist'
  

type UserShape = {
  userID?: number;
  roleName?: string;   // očekivano: 'Admin' za admin korisnika
  roleID?: number;     // očekivano: 1 za admin korisnika
};

function getRouteFromHash(): RouteKey {
  const path = (location.hash.replace('#', '').trim() || '/');
  if (path.startsWith('/proizvodi-admin')) return '/proizvodi-admin';
  if (path.startsWith('/brendovi')) return '/brendovi';
  if (path.startsWith('/kontakt')) return '/kontakt';
  if (path.startsWith('/recenzije')) return '/recenzije';
  if (path.startsWith('/login')) return '/login';
  if (path.startsWith('/register')) return '/register';
  if (path.startsWith('/profil')) return '/profil';
  if (path.startsWith('/promjena-lozinke')) return '/promjena-lozinke';
  if (path.startsWith('/podrska')) return '/podrska';
  if (path.startsWith('/moji-zahtjevi')) return '/moji-zahtjevi';
  if (path.startsWith('/support-admin')) return '/support-admin';
  if (path.startsWith('/wishlist')) return '/wishlist';
  if (path.startsWith('/proizvodi') || path === '/') return '/proizvodi';
  return '/proizvodi';
}

function getCurrentUser(): UserShape | null {
  const userJson = localStorage.getItem('user');
  try {
    const parsed = userJson ? JSON.parse(userJson) : null;
    if(!parsed)return null;
    return {
      userID:parsed.id || parsed.userId,
      roleName: parsed.role,
      roleID: parsed.role === 'Admin' ? 1 : undefined
    };
  } catch {
    return null;
  }
}

function isAdmin(user: UserShape | null): boolean {
  if (!user) return false;
  return user.roleName === 'Admin' || user.roleID === 1;
}

export function setupApp(root: HTMLElement): void {
  if (!root) return;

  // Header + nav 
  root.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a href="#/proizvodi" class="logo">
          <img src="/images/brands/MobLabLogo.png" alt="MobLab" />
        </a>
        <nav class="nav">
          <a href="#/proizvodi" class="nav-link" data-link="/proizvodi">Proizvodi</a>
          <a href="#/brendovi" class="nav-link" data-link="/brendovi">Brendovi</a>
          <a href="#/proizvodi-admin" class="nav-link" data-link="/proizvodi-admin">Proizvodi (Admin)</a>
          <a href="#/kontakt" class="nav-link" data-link="/kontakt">Kontakt</a>
          <a href="#/recenzije" class="nav-link" data-link="/recenzije">Recenzije</a>
          <a href="#/podrska" class="nav-link" data-link="/podrska">Podrška</a>
          <a href="#/moji-zahtjevi" class="nav-link" data-link="/moji-zahtjevi">Moji zahtjevi</a>
          <a href="#/support-admin" class="nav-link" data-link="/support-admin" style="display:none;">Podrška (Admin)</a>
          <a href="#/profil" class="nav-link" data-link="/profil">Moj profil</a>
          <a href="#/promjena-lozinke" class="nav-link" data-link="/promjena-lozinke">Promjena lozinke</a>
          <a href="#/login" class="nav-link" data-link="/login">Prijava</a>
          <a href="#/register" class="nav-link" data-link="/register">Registracija</a>
          <a href="#" id="logout-link" class="nav-link" style="display:none;">Odjava</a>
          <a href="#/wishlist" class="nav-link" data-link="/wishlist">Korpa</a>
        </nav>
      </div>
    </header>
    <main class="site-main">
      <div class="container" id="page-container"></div>
    </main>
  `;

  const container = document.getElementById('page-container') as HTMLElement;
  const links = root.querySelectorAll<HTMLAnchorElement>('a[data-link]');
  const logoutLink = document.getElementById('logout-link') as HTMLAnchorElement | null;

  const loginLink = root.querySelector<HTMLAnchorElement>('a[data-link="/login"]');
  const registerLink = root.querySelector<HTMLAnchorElement>('a[data-link="/register"]');
  const profileLink = root.querySelector<HTMLAnchorElement>('a[data-link="/profil"]');
  const changePasswordLink = root.querySelector<HTMLAnchorElement>('a[data-link="/promjena-lozinke"]');
  const myTicketsLink = root.querySelector<HTMLAnchorElement>('a[data-link="/moji-zahtjevi"]');
  const supportAdminLink = root.querySelector<HTMLAnchorElement>('a[data-link="/support-admin"]');
  

  // Logout event
  if (logoutLink) {
    logoutLink.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.hash = '#/login';
    });
  }

  const setActive = (route: RouteKey) => {
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('data-link') === route));
  };

  const render = () => {
    const route = getRouteFromHash();
    setActive(route);

    const user = getCurrentUser();
    const admin = isAdmin(user);
    const token = localStorage.getItem('token');

    // Prikaz/sakrivanje linkova
    if (loginLink)    loginLink.style.display = user ? 'none' : 'inline';
    if (registerLink) registerLink.style.display = user ? 'none' : 'inline';
    if (logoutLink)   logoutLink.style.display = user ? 'inline' : 'none';
    if (profileLink)  profileLink.style.display = user ? 'inline' : 'none';
    if (changePasswordLink) changePasswordLink.style.display = user ? 'inline' : 'none';
    if (myTicketsLink) myTicketsLink.style.display = user ? 'inline' : 'none';
    if (supportAdminLink) supportAdminLink.style.display = admin ? 'inline' : 'none'
    // Guard: rute koje traže login
    if ((route === '/profil' || route === '/promjena-lozinke' || route === '/moji-zahtjevi') && !token) {
      location.hash = '#/login';
      return;
    }

    // Guard: /support-admin samo za admin + token
    if (route === '/support-admin') {
      if (!token || !admin) {
        location.hash = '#/login'; 
        return;
      }
    }

    // Render rute
    if (route === '/login') return renderLogin(container);
    if (route === '/register') return renderRegister(container);
    if (route === '/proizvodi') return renderProducts(container);
    if (route === '/brendovi') return renderBrands(container);
    if (route === '/kontakt') return renderContact(container);
    if (route === '/recenzije') return renderReviewsPage(container);
    if (route === '/proizvodi-admin') return renderProductsAdmin(container);
    if (route === '/profil') return mountProfilePage(container);
    if (route === '/promjena-lozinke') return mountChangePasswordPage(container);
    if (route === '/podrska') return renderSupportPage(container);
    if (route === '/moji-zahtjevi') return renderMySupportTicketsPage(container);
    if (route === '/support-admin') return renderSupportAdminPage(container);
    if (route === '/wishlist') return renderWishlistPage(container);
    

    return renderProducts(container);
  };

  window.addEventListener('hashchange', render);
  render();
}
