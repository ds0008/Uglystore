import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import AuthFormLayout from "../components/AuthFormLayout";
import FormInput from "../components/FormInput";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Sign In"
      onSubmit={handleSubmit}
      submitLabel="Sign In"
      loading={loading}
      loadingLabel="Signing in..."
      altText="Don't have an account?"
      altLinkTo="/register"
      altLinkLabel="Sign up"
    >
      <FormInput
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <FormInput
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
      />
    </AuthFormLayout>
  );
}
