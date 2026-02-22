import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">

      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title"> CoreCare</h1>
        <p className="hero-subtitle">Eat better. Feel better. Live better.</p>
        <p className="hero-description">
          Get personalized recipes tailored to your health conditions, symptoms, and dietary restrictions.
        </p>
        <button className="cta-btn" onClick={() => navigate("/signup")}>Get Started</button>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step-card">
            <span className="step-number">1</span>
            <h3>Create an Account</h3>
            <p>Sign up and tell us about your health conditions and dietary needs.</p>
          </div>
          <div className="step-card">
            <span className="step-number">2</span>
            <h3>Enter Your Health Info</h3>
            <p>Select your symptoms, diagnoses, and dietary restrictions.</p>
          </div>
          <div className="step-card">
            <span className="step-number">3</span>
            <h3>Get Personalized Recipes</h3>
            <p>Receive recipes crafted specifically for your health profile.</p>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="features-section">
        <h2>What We Offer</h2>
        <div className="features-container">
          <div className="feature-card">
            <h3>Personalized Recipes</h3>
            <p>Recipes tailored to your unique health needs and dietary restrictions.</p>
          </div>
          <div className="feature-card">
            <h3>Symptom Aware</h3>
            <p>We take your symptoms into account to suggest meals that help you feel better.</p>
          </div>
          <div className="feature-card">
            <h3>Dietary Restriction Friendly</h3>
            <p>Gluten-free, lactose-free, and more — we've got you covered.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;