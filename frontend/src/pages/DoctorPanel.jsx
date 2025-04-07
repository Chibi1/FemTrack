import { useEffect, useState } from 'react';

function DoctorPanel() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/';
      return;
    }

    fetch('/panel-lekarza', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/';
          return;
        }

        const data = await res.json();
        setMessage(data.message || 'Witaj w panelu lekarza!');
      })
      .catch((err) => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/';
      });
  }, []);

  return (
    <div>
      <h2>Panel lekarza</h2>
      <p>{message}</p>
      <button
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/';
        }}
      >
        Wyloguj się
      </button>
    </div>
  );
}

export default DoctorPanel;
