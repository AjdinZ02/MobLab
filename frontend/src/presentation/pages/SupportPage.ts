import { httpPost } from '../../infrastructure/http/client';

type CreateSupportTicket = {
  subject: string;
  description: string;
  userID?: number;
};

type SupportTicketDto = {
  ticketID: number;
  userID?: number;
  subject: string;
  description: string;
  status: string;
};

export function renderSupportPage(container: HTMLElement): void {
  container.innerHTML = `
    <section class="container">
      <h1>Kontaktiraj podršku</h1>
      <form id="support-form" class="card">
        <div class="field">
          <label>Naslov (Subject) <span class="req">*</span></label>
          <input id="subject" type="text" required maxlength="100" />
        </div>

        <div class="field">
          <label>Opis problema (Description) <span class="req">*</span></label>
          <textarea id="description" rows="6" required maxlength="255"></textarea>
        </div>

        <button id="send-btn" type="submit">Pošalji zahtjev</button>
        <p id="support-feedback" class="muted"></p>
      </form>
    </section>
  `;

  const form = document.getElementById('support-form') as HTMLFormElement | null;
  const feedback = document.getElementById('support-feedback') as HTMLParagraphElement | null;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!feedback) return;
    feedback.textContent = 'Slanje...';

    const subject = (document.getElementById('subject') as HTMLInputElement).value.trim();
    const description = (document.getElementById('description') as HTMLTextAreaElement).value.trim();

    // Ako imaš user u localStorage kao u app.ts:
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const userID: number | undefined = user?.userID ?? undefined;
    
    try {
      const ticket = await httpPost<CreateSupportTicket, SupportTicketDto>(
        '/api/supporttickets',
        { subject, description, userID }
      );

      feedback.textContent = `Zahtjev poslan. Broj tiketa: #${ticket?.ticketID ?? '—'}`;
      form?.reset();
    } catch (err: any) {
      feedback.textContent = err?.message ?? 'Došlo je do greške.';
    }
  });
}
