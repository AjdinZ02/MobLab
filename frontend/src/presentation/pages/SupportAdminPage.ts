import { httpGet, httpPatchAuth } from '../../infrastructure/http/client';

type SupportTicketDto = {
  ticketID: number;
  userID?: number;
  subject: string;
  description: string;
  status: 'Pending' | 'InProgress' | 'Completed' | string;
};

// Lokalizacija + stil klase za bedževe
const STATUS_LABELS: Record<string, string> = {
  Pending: 'Na čekanju',
  InProgress: 'U obradi',
  Completed: 'Završeno',
};

const STATUS_CLASS: Record<string, string> = {
  Pending: 'badge badge-pending',
  InProgress: 'badge badge-progress',
  Completed: 'badge badge-done',
};

async function fetchAllTickets(take = 50): Promise<SupportTicketDto[]> {
  return await httpGet<SupportTicketDto[]>(`/api/supporttickets?take=${take}`);
}

async function fetchTicketsByUser(userId: number, status?: string): Promise<SupportTicketDto[]> {
  const path = status
    ? `/api/supporttickets/by-user/${userId}?status=${encodeURIComponent(status)}`
    : `/api/supporttickets/by-user/${userId}`;
  return await httpGet<SupportTicketDto[]>(path);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function renderRow(t: SupportTicketDto): string {
  const currentLabel = STATUS_LABELS[t.status] || t.status;
  const currentClass = STATUS_CLASS[t.status] || 'badge';
  return `
    <tr data-id="${t.ticketID}">
      <td>${t.ticketID}</td>
      <td>${t.userID ?? '-'}</td>
      <td>${escapeHtml(t.subject)}</td>
      <td>${escapeHtml(t.description)}</td>
      <td><span class="${currentClass}">${currentLabel}</span></td>
      <td class="actions">
        <select class="status-select">
          <option value="Pending" ${t.status === 'Pending' ? 'selected' : ''}>Na čekanju</option>
          <option value="InProgress" ${t.status === 'InProgress' ? 'selected' : ''}>U obradi</option>
          <option value="Completed" ${t.status === 'Completed' ? 'selected' : ''}>Završeno</option>
        </select>
        <button class="apply-btn" type="button">Spremi</button>
      </td>
    </tr>
  `;
}

function renderTable(tickets: SupportTicketDto[]): string {
  if (!tickets.length) {
    return `<p class="muted">Nema zahtjeva.</p>`;
  }
  return `
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>UserID</th>
          <th>Naslov</th>
          <th>Opis</th>
          <th>Status</th>
          <th>Promjena statusa</th>
        </tr>
      </thead>
      <tbody>
        ${tickets.map(renderRow).join('')}
      </tbody>
    </table>
  `;
}

export function renderSupportAdminPage(container: HTMLElement): void {
  container.innerHTML = `
    <section class="container">
      <div class="toolbar">
        <h1>Podrška (Admin)</h1>
        <div class="filters">
          <label>Status:</label>
          <select id="status-filter">
            <option value="">Svi</option>
            <option value="Pending">Na čekanju</option>
            <option value="InProgress">U obradi</option>
            <option value="Completed">Završeno</option>
          </select>

          <label>UserID:</label>
          <input id="userId-filter" type="number" min="1" placeholder="(opcionalno)" />

          <label>Broj zapisa:</label>
          <input id="take-filter" type="number" min="1" value="50" />

          <button id="refresh-btn" type="button">Osvježi</button>
        </div>
      </div>
      <div id="tickets-wrap">
        <p class="muted">Učitavanje...</p>
      </div>
    </section>
  `;

  const wrap   = document.getElementById('tickets-wrap') as HTMLElement;
  const refreshBtn = document.getElementById('refresh-btn') as HTMLButtonElement;
  const statusSel  = document.getElementById('status-filter') as HTMLSelectElement;
  const userIdInp  = document.getElementById('userId-filter') as HTMLInputElement;
  const takeInp    = document.getElementById('take-filter') as HTMLInputElement;

  async function load() {
    wrap.innerHTML = `<p class="muted">Učitavanje...</p>`;
    try {
      const status = statusSel.value || '';
      const userIdStr = userIdInp.value.trim();
      const take = Math.max(1, Number(takeInp.value) || 50);

      let tickets: SupportTicketDto[] = [];
      if (userIdStr) {
        const uid = Number(userIdStr);
        tickets = await fetchTicketsByUser(uid, status || undefined);
      } else {
        tickets = await fetchAllTickets(take);
        // Ako je odabran status, filtriraj klijentski (GetAll nema status parametar)
        if (status) tickets = tickets.filter(t => t.status === status);
      }

      wrap.innerHTML = renderTable(tickets);
    } catch (err: any) {
      wrap.innerHTML = `<p class="error">Greška pri učitavanju: ${err?.message ?? 'nepoznato'}</p>`;
    }
  }

  // Delegacija događaja za dugmad "Spremi" u tabeli
  wrap.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('apply-btn')) return;

    const tr = target.closest('tr');
    if (!tr) return;

    const idAttr = tr.getAttribute('data-id');
    if (!idAttr) return;
    const ticketId = Number(idAttr);

    const select = tr.querySelector<HTMLSelectElement>('.status-select');
    const newStatus = select?.value;
    if (!newStatus) return;

    const token = localStorage.getItem('token') || undefined;
    try {
      await httpPatchAuth(`/api/supporttickets/${ticketId}/status?value=${encodeURIComponent(newStatus)}`, token);
      // osvježi bedž u istoj vrsti (bez full reload)
      const badge = tr.querySelector('.badge');
      if (badge) {
        badge.textContent = STATUS_LABELS[newStatus] || newStatus;
        badge.className = STATUS_CLASS[newStatus] || 'badge';
      }
    } catch (err: any) {
      alert(`Greška pri promjeni statusa: ${err?.message ?? 'nepoznato'}`);
    }
  });

  // Filteri
  refreshBtn.addEventListener('click', load);
  statusSel.addEventListener('change', load);

  load();
}
