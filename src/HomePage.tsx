import { Link } from "react-router-dom";
import './homePage.css'; // Assuming you're using an external CSS file
import { add, list } from './dal'

async function createTodo() {
	const result = await add("Test Todo")
	console.log(result)
}

async function listTodos() {
	// @ts-ignore
	const address = await globalThis.arweaveWallet.getActiveAddress()
	const result = await list(address)
	console.log(result)

}

function HomePage() {
	return (
		<div className="homepage-container">
			<h1 className="homepage-title">Welcome to the Permaweb!</h1>
			<Link to="/about/" className="homepage-link">
				<div className="homepage-link-content">About</div>
			</Link>
			<button onClick={createTodo}>Create Todo</button>
			<button onClick={listTodos}>List</button>
		</div>
	);
}

export default HomePage;