import { renderProducts } from './pages/ProductsPage';
import { renderContact } from './pages/ContactPage';
import { renderBrands } from './pages/BrandsPage';
import { renderProductsAdmin } from './pages/ProductsAdminPage';
import {renderReviewsPage} from './pages/ReviewsPage';
import { renderLogin } from './pages/LoginPage';
import { renderRegister } from './pages/RegisterPage';
import { mountProfilePage } from './pages/ProfilePage';
import { mountChangePasswordPage } from './pages/ChangePasswordPage';


type RouteKey = '/' | '/proizvodi' | '/kontakt'
 | '/brendovi' | '/proizvodi-admin'
  | '/recenzije' | '/login' | '/register'
  | '/profil' | '/promjena-lozinke';


function getRouteFromHash(): RouteKey {
  const path = location.hash.replace('#', '').trim() || '/';
  if (path.startsWith('/proizvodi-admin')) return '/proizvodi-admin';
  if (path.startsWith('/brendovi')) return '/brendovi';
  if (path.startsWith('/kontakt')) return '/kontakt';
  if (path.startsWith('/recenzije')) return '/recenzije';
  if (path.startsWith('/login')) return '/login';
  if (path.startsWith('/register')) return '/register';
  if (path.startsWith('/profil')) return '/profil';
  if (path.startsWith('/promjena-lozinke')) return '/promjena-lozinke';
  if (path.startsWith('/proizvodi') || path === '/') return '/proizvodi';
  return '/proizvodi';
}

function getCurrentUser() {
  const userJson = localStorage.getItem("user");
  return userJson ? JSON.parse(userJson) : null;
}

export function setupApp(root: HTMLElement): void {
  console.log("setupapp called");
  if (!root) return;

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
          <a href="#/profil" class="nav-link" data-link="/profil">Moj profil</a>
          <a href="#/promjena-lozinke" class="nav-link" data-link="/promjena-lozinke">Promjena lozinke</a>
          <a href="#/login" class="nav-link" data-link="/login">Prijava</a>
          <a href="#/register" class="nav-link" data-link="/register">Registracija</a>
          <a href="#" id="logout-link" class="nav-link" style="display:none;">Odjava</a>
        </nav>
      </div>
    </header>
    <main class="site-main">
      <div class="container" id="page-container"></div>
    </main>
    
  `;

  const container = document.getElementById('page-container') as HTMLElement;
  const links = root.querySelectorAll<HTMLAnchorElement>('a[data-link]');
  const logoutLink = document.getElementById("logout-link");
  const loginLink= root.querySelector<HTMLAnchorElement>('a[data-link="/login"]');
  const registerLink= root.querySelector<HTMLAnchorElement>('a[data-link="/register"]');
  const profileLink= root.querySelector<HTMLAnchorElement>('a[data-link="/profil"]');
  const changePasswordLink= root.querySelector<HTMLAnchorElement>('a[data-link="/promjena-lozinke"]');

// Logout event
if (logoutLink) {
  logoutLink.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    location.hash = "#/login";
  });
}
  const setActive = (route: RouteKey) => {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('data-link') === route));
  };

  
const render = () => {
    const route = getRouteFromHash();
    setActive(route);
    console.log("Route:", route);

    const user = getCurrentUser();
    if(loginLink){
      loginLink.style.display = user ? "none" : "inline";
    }
    if(registerLink){
      registerLink.style.display = user ? "none" : "inline";
    }
    if (logoutLink){
    logoutLink.style.display = user ? "inline" : "none";
    }


    if(profileLink){
      profileLink.style.display = user ? "inline" : "none";
    }
    if(changePasswordLink){
      changePasswordLink.style.display = user ? "inline" : "none";
    }
    const token=localStorage.getItem("token");
    if((route==='/profil' || route==='/promjena-lozinke') && !token){
      location.hash="#/login";
      return;
    }

    if (route === '/login') return renderLogin(container);
    if (route === '/register') return renderRegister(container);
    if (route === '/proizvodi') return renderProducts(container);
    if (route === '/brendovi') return renderBrands(container);
    if (route === '/kontakt') return renderContact(container);
    if (route === '/recenzije') return renderReviewsPage(container);
    if (route === '/proizvodi-admin') return renderProductsAdmin(container);
    if (route === '/profil') return mountProfilePage(container);
    if (route === '/promjena-lozinke') return mountChangePasswordPage(container);


    return renderProducts(container);
  };


  window.addEventListener('hashchange', render);
  render();
}


