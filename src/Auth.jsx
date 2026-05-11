import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

export default function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`${BASE_URL}/users/me`, {
        credentials: "include",
      });

      if (response.status === 200) {
        const userData = await response.json();
        setUser(userData);
        setTimeout(() => {
          navigate("/");
        }, 100);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const url = isLogin
      ? `${BASE_URL}/users/login`
      : `${BASE_URL}/users/register`;

    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error);
      }

      if (isLogin) {
        await fetch(`${BASE_URL}/users/me`, {
          credentials: "include",
        })
          .then((res) => res.json())
          .then((userData) => {
            setUser(userData.user);
            navigate("/");
          });
      } else {
        // ✅ SIGNUP
        setIsLogin(true);
        setError("Account created. Please login.");
        setForm({ name: "", email: "", password: "" });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isLogin ? "Login" : "Signup"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <input
              style={styles.input}
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}

          <input
            style={styles.input}
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit">
            {isLogin ? "Login" : "Signup"}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isLogin ? "No account?" : "Already have account?"}
          <span
            style={styles.toggle}
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setForm({ name: "", email: "", password: "" });
            }}
          >
            {isLogin ? " Signup" : " Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#18191c",
  },
  card: {
    background: "#232428",
    padding: "28px",
    borderRadius: "12px",
    width: "320px",
    border: "1px solid #2f3035",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  },
  title: {
    marginBottom: "16px",
    fontSize: "22px",
    fontWeight: "600",
    color: "#e4e6eb",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #2f3035",
    backgroundColor: "#18191c",
    color: "#e4e6eb",
    fontSize: "14px",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2f3035",
    color: "#e4e6eb",
    cursor: "pointer",
    fontSize: "14px",
  },
  toggleText: {
    marginTop: "12px",
    fontSize: "13px",
    color: "#aaa",
  },
  toggle: {
    color: "#4da3ff",
    cursor: "pointer",
    marginLeft: "5px",
  },
  error: {
    color: "#ff6b6b",
    fontSize: "13px",
    background: "#2a1a1a",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ff6b6b",
  },
};
