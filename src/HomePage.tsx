import './homePage.css';
import { add, list, complete, unComplete, deleteTodo } from './dal'
import { useState, useEffect } from 'preact/hooks';
import { FunctionalComponent } from 'preact';
import DeleteConfirmationModal from './tools/DeleteConfirmationModal';
import { JSX } from 'preact';

type Result = {
	Complete: number
	Description: string,
	Id: string
}

async function createTodo(description: string) {
	const result = await add(description)
	console.log(result)
}

async function listTodos() {
	// @ts-ignore
	const address = await globalThis.arweaveWallet.getActiveAddress()
	const result = await list(address)

	return result
}

async function completeTodo(id: string) {
	// @ts-ignore
	const address = await globalThis.arweaveWallet.getActiveAddress()
	const result = await complete(id, address)

	return result
}

async function unCompleteTodo(id: string) {
	// @ts-ignore
	const address = await globalThis.arweaveWallet.getActiveAddress()
	const result = await unComplete(id, address)

	return result
}

async function deleteTodo_(id: string) {
	// @ts-ignore
	const address = await globalThis.arweaveWallet.getActiveAddress()
	const result = await deleteTodo(id, address)

	return result
}



const HomePage: FunctionalComponent = () => {
	const [results, setResults] = useState<Result[]>([])
	const [description, setDescription] = useState<string>('')
	const [todoToDelete, setTodoToDelete] = useState<string | null>(null)
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const handleList = async () => {
		await listTodos().then(JSON.parse).then(r => setResults(r))
	}

	const handleCreate = async () => {
		if (!description || isProcessing) return

		setIsProcessing(true)
		await createTodo(description)
			.then(() => setDescription(''))
			.then(handleList)
			.finally(() => setIsProcessing(false));
	}

	const handleComplete = async (r: Result) => {
		if (isProcessing) return;

		setIsProcessing(true);
		const run = async () => {
			if (!r.Complete) {
				await completeTodo(r.Id);
			} else {
				await unCompleteTodo(r.Id);
			}
		};

		await run().then(handleList).finally(() => setIsProcessing(false));
	};

	const handleDelete = async (id: string | null) => {
		if (!id || isProcessing) return;
	
		const fadeOutElement = document.getElementById(id);
		if (fadeOutElement) {
			fadeOutElement.classList.add('fade-out');
		}
	
		setIsProcessing(true);
	
		// Delay deletion to allow fade-out animation to complete
		setTimeout(async () => {
			await deleteTodo_(id).then(() => {
				setResults(results.filter(result => result.Id !== id));
			}).finally(() => {
				setIsProcessing(false);
				setTodoToDelete(null);
			});
		}, 500);
	};
	

	useEffect(() => {
		handleList()
	}, [])

	return (
		<>
			<div className="homepage-container">
				<h1 className="homepage-title">Todo List</h1>

				<input
					type="text"
					onChange={(e) => setDescription(e.target.value)}
					value={description}
					placeholder="Enter a new todo..."
					disabled={isProcessing}
				/>

				<div>
					<button 
						onClick={handleCreate} 
						className="homepage-link-content"
						disabled={isProcessing}
					>
						{isProcessing ? 'Processing...' : 'Create Todo'}
					</button>
				</div>

				{!results.length ? <>No Todos. Try creating one</> : results.map(r => (
					<div key={r.Id} id={r.Id} className={`result-item ${r.Complete ? 'complete' : ''}`}>
						<div className='clickable' onClick={() => setTodoToDelete(r.Id)}>x</div>
						<div className='cursor-none'>{r.Description}</div>
						<div className='clickable' onClick={() => handleComplete(r)}>{r.Complete ? '✅' : '⬜️'}</div>
					</div>
				))}

			</div>

			{/* @ts-ignore */}
			<DeleteConfirmationModal
				isOpen={!!todoToDelete}
				onClose={() => setTodoToDelete(null)}
				onDelete={() => handleDelete(todoToDelete)}
			/>
		</>
	);
}

export default HomePage;