import { Link } from "react-router-dom";
import './about.css'; // Assuming you're using an external CSS file

function About() {
	return (
		<div className="about-container">
			<h1 className="about-title">Welcome to the About page!</h1>
			<Link to="/" className="about-link">
				<div className="about-link-content">Home</div>
			</Link>
		</div>
	);
}

export default About;
