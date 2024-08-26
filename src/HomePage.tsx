import { Link } from "react-router-dom";
import './homePage.css'; // Assuming you're using an external CSS file

function HomePage() {
	return (
		<div className="homepage-container">
			<h1 className="homepage-title">Welcome to the Permaweb!</h1>
			<Link to="/about/" className="homepage-link">
				<div className="homepage-link-content">About</div>
			</Link>
		</div>
	);
}

export default HomePage;