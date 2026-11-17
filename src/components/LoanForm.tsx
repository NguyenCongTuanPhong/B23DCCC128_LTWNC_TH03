'use client';

import { useActionState } from 'react';
import { TERMS } from '@/data/books';
import { TERM_LABEL } from '@/lib/format';
import type { Book, LoanFormState } from '@/types';

type LoanFormProps = {
  books: Book[];
  defaultBookId?: string;
  action: (
    state: LoanFormState,
    formData: FormData,
  ) => Promise<LoanFormState>;
};

const initialState: LoanFormState = { errors: {}, values: {} };

export default function LoanForm({
  books,
  defaultBookId,
  action,
}: LoanFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formKey = JSON.stringify([state.values, state.ok]);

  return (
    <form action={formAction} className="loan-form" key={formKey}>
      <div className="loan-form-field">
        <label htmlFor="bookId">Sách</label>
        <select
          aria-invalid={Boolean(state.errors.bookId)}
          defaultValue={
            state.values.bookId ?? (state.ok ? '' : defaultBookId ?? '')
          }
          id="bookId"
          name="bookId"
        >
          <option value="">-- Chọn sách --</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} ({book.copies} bản)
            </option>
          ))}
        </select>
        {state.errors.bookId && <p role="alert">{state.errors.bookId}</p>}
      </div>

      <div className="loan-form-field">
        <label htmlFor="pickupDate">Ngày lấy sách</label>
        <input
          aria-invalid={Boolean(state.errors.pickupDate)}
          defaultValue={state.values.pickupDate ?? ''}
          id="pickupDate"
          name="pickupDate"
          type="date"
        />
        {state.errors.pickupDate && <p role="alert">{state.errors.pickupDate}</p>}
      </div>

      <div className="loan-form-field">
        <label htmlFor="term">Thời hạn mượn</label>
        <select
          aria-invalid={Boolean(state.errors.term)}
          defaultValue={state.values.term ?? ''}
          id="term"
          name="term"
        >
          <option value="">-- Chọn thời hạn --</option>
          {TERMS.map((term) => (
            <option key={term} value={term}>{TERM_LABEL[term]}</option>
          ))}
        </select>
        {state.errors.term && <p role="alert">{state.errors.term}</p>}
      </div>

      <div className="loan-form-field">
        <label htmlFor="quantity">Số quyển</label>
        <input
          aria-invalid={Boolean(state.errors.quantity)}
          defaultValue={state.values.quantity ?? '1'}
          id="quantity"
          name="quantity"
          type="number"
        />
        {state.errors.quantity && <p role="alert">{state.errors.quantity}</p>}
      </div>

      <div className="loan-form-field">
        <label htmlFor="reason">Lý do mượn</label>
        <textarea
          aria-invalid={Boolean(state.errors.reason)}
          defaultValue={state.values.reason ?? ''}
          id="reason"
          name="reason"
          rows={3}
        />
        {state.errors.reason && <p role="alert">{state.errors.reason}</p>}
      </div>

      {state.message && (
        <p
          className={`form-message ${state.ok ? 'form-success' : 'form-error'}`}
          role={state.ok ? 'status' : 'alert'}
        >
          {state.message}
        </p>
      )}
      <button className="button button-dark button-full" disabled={pending} type="submit">
        {pending ? 'Đang gửi...' : 'Gửi yêu cầu'}
      </button>
    </form>
  );
}
