import './homePage.css';
import { add, list, complete, unComplete, deleteTodo } from './dal';
import { useState, useEffect } from 'preact/hooks';
import { FunctionalComponent } from 'preact';
import DeleteConfirmationModal from './tools/DeleteConfirmationModal';
import { JSX } from 'preact';

type Result = {
	Complete: number;
	Description: string;
	Id: string;
};

const WALLET_PERMISSIONS = ['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'ACCESS_ALL_ADDRESSES'];

async function createTodo(description: string) {
	const result = await add(description);
	console.log(result);
}

async function listTodos(address: string) {
	const result = await list(address);
	return result;
}

async function completeTodo(id: string, address: string) {
	const result = await complete(id, address);
	return result;
}

async function unCompleteTodo(id: string, address: string) {
	const result = await unComplete(id, address);
	return result;
}

async function deleteTodo_(id: string, address: string) {
	const result = await deleteTodo(id, address);
	return result;
}

const HomePage: FunctionalComponent = () => {
	const [results, setResults] = useState<Result[]>([]);
	const [description, setDescription] = useState<string>('');
	const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [walletAddress, setWalletAddress] = useState<string | null>(null);

	const handleList = async () => {
		if (!walletAddress) return;
		const todos = await listTodos(walletAddress);
		setResults(JSON.parse(todos));
	};

	const handleCreate = async () => {
		if (!description || isProcessing) return;
		setIsProcessing(true);
		await createTodo(description)
			.then(() => setDescription(''))
			.then(handleList)
			.finally(() => setIsProcessing(false));
	};

	const handleComplete = async (r: Result) => {
		if (!walletAddress || isProcessing) return;

		setIsProcessing(true);
		const run = async () => {
			if (!r.Complete) {
				await completeTodo(r.Id, walletAddress);
			} else {
				await unCompleteTodo(r.Id, walletAddress);
			}
		};

		await run().then(handleList).finally(() => setIsProcessing(false));
	};

	const handleDelete = async (id: string | null) => {
		if (!id || !walletAddress || isProcessing) return;

		const fadeOutElement = document.getElementById(id);
		if (fadeOutElement) {
			fadeOutElement.classList.add('fade-out');
		}

		setIsProcessing(true);

		setTimeout(async () => {
			await deleteTodo_(id, walletAddress)
				.then(() => setResults(results.filter(result => result.Id !== id)))
				.finally(() => {
					setIsProcessing(false);
					setTodoToDelete(null);
				});
		}, 500);
	};

	const handleArConnect = async () => {
		if (!walletAddress && window.arweaveWallet) {
			try {
				await window.arweaveWallet.connect(WALLET_PERMISSIONS);
				const address = await window.arweaveWallet.getActiveAddress();
				setWalletAddress(address);
				// @ts-ignore
				globalThis.walletAddress = address // Set the global variable
			} catch (e) {
				console.error(e);
			}
		}
	};

	useEffect(() => {
		if (walletAddress) {
			handleList();
		}
	}, [walletAddress]);

	return (
		<>
			<div className="homepage-container">
				<h1 className="homepage-title">Todo List</h1>

				{!walletAddress && (
					<button onClick={handleArConnect} className="connect-button">
						Connect Wallet
					</button>
				)}

				{walletAddress && (
					<>
						<textarea
							onChange={(e) => setDescription(e.target.value)}
							value={description}
							placeholder="Enter a new todo..."
							disabled={isProcessing}
						/>

						<button 
							onClick={handleCreate} 
							className={`homepage-link-content ${isProcessing || !description ? 'disabled-button' : ''}`}
							disabled={isProcessing || !description}
						>
							{isProcessing ? 'Processing...' : 'Create Todo'}
						</button>

						{!results.length ? <>No Todos. Try creating one</> : results.map(r => (
							<div key={r.Id} id={r.Id} className={`result-item ${r.Complete ? 'complete' : ''}`}>
								<div className='clickable' onClick={() => setTodoToDelete(r.Id)}>x</div>
								<div className='cursor-none'>{r.Description}</div>
								<div className='clickable' onClick={() => handleComplete(r)}>{r.Complete ? '✅' : '⬜️'}</div>
							</div>
						))}
					</>
				)}
			</div>

			{/* @ts-ignore */}
			<DeleteConfirmationModal
				isOpen={!!todoToDelete}
				onClose={() => setTodoToDelete(null)}
				onDelete={() => handleDelete(todoToDelete)}
			/>
		</>
	);
};

export default HomePage;
