import { cloneElement, useId } from 'react';

export function PageCard({ children, className = '', ...props }) {
  return (
    <section className={`page-card ${className}`} {...props}>
      {children}
    </section>
  );
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  return <button type={type} className={`button button--${variant} ${className}`} {...props} />;
}

export function Alert({ children, variant = 'error' }) {
  if (!children) return null;
  return (
    <p className={`alert alert--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}

export function FormField({ label, children, hint, className = '' }) {
  const generatedId = useId();
  const id = children.props.id || generatedId;
  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, {
        id,
        'aria-describedby': hint ? `${id}-hint` : children.props['aria-describedby'],
      })}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}

export function CollectionStatus({ loading, error, reload }) {
  if (loading) return <p role="status">Carregando registros...</p>;
  if (error)
    return (
      <>
        <Alert>{error}</Alert>
        <Button onClick={reload}>Tentar novamente</Button>
      </>
    );
  return null;
}
