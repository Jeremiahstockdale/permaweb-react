import './homePage.css';
import { add, list, complete, unComplete, deleteTodo } from './dal'
import { useEffect, useState } from "react";
import DeleteConfirmationModal from './tools/DeleteConfirmationModal';

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



function HomePage() {
	const [results, setResults] = useState<Result[]>([])
	const [description, setDescription] = useState<string>('')
	const [todoToDelete, setTodoToDelete] = useState<string | null>(null)

	const handleList = async () => {
		await listTodos().then(JSON.parse).then(r => setResults(r))
	}

	const handleCreate = async () => {
		if (!description) return

		await createTodo(description)
			.then(() => setDescription(''))
			.then(handleList)
	}

	const handleComplete = async (r: Result) => {
		const run = async () => {
			if (!r.Complete) {
				await completeTodo(r.Id)
			} else {
				await unCompleteTodo(r.Id)
			}
		}

		await run().then(handleList)
	}

	const handleDelete = async (id: string | null) => {
		if (!id) return

		await deleteTodo_(id).then(handleList)
	}

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
				/>

				<div>
					<button onClick={handleCreate} className="homepage-link-content">Create Todo</button>
				</div>


				{!results.length ? <>No Todos. Try creating one</> : results.map(r => (
					<div key={r.Id} className="result-item">
						<div className='clickable' onClick={() => setTodoToDelete(r.Id)}>x</div>
						<div className='cursor-none'>{r.Description}</div>
						<div className='clickable' onClick={() => handleComplete(r)}>{r.Complete ? '✅' : '⬜️'}</div>
					</div>
				))}

			</div>

			<DeleteConfirmationModal
				isOpen={!!todoToDelete}
				onClose={() => setTodoToDelete(null)}
				onDelete={() => handleDelete(todoToDelete)}
			/>
		</>
	);
}

export default HomePage;