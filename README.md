# Latest
arweave.net/1_XhLgOYZBBnBvLtSjAeRF2eVFplwe1hoM3A5dIYiec

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).




# Make a Preact Todo List App on the Permaweb

## Step 1: Setting Up Your Environment

Ensure Node.js and npm are installed.
Install a wallet extension like ArConnect in your browser to interact with the Arweave network.

## Create the Preact App
Run the following commands to create and start your Preact app:
```bash
npx preact-cli create default my-preact-app
```
```bash
cd my-preact-app
```
```bash
npm run dev
```
Open localhost:8080 in your browser. Make sure to use localhost to ensure access to your wallet.
Install AOS (Arweave Operating System)
Install AOS globally using npm:
```bash
npm i -g https://get_ao.g8way.io
```
## Step 2: Create the Backend
Create a folder called api inside your project.
Create a file named todos.lua in the api folder.
Setting Up the AOS Backend
In a separate terminal, navigate to your project directory and run:

```bash
aos todos --sqlite
```

Add the following code to your todos.lua file:

```lua
-- TODOS
local sqlite3 = require('lsqlite3')
Configured = Configured or false 

function Configure() 
  Db = sqlite3.open_memory()
  dbAdmin = require('@rakis/DbAdmin').new(Db)
  
  dbAdmin:exec([[
CREATE TABLE IF NOT EXISTS Todos (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Owner TEXT NOT NULL,
  Description TEXT NOT NULL,
  Complete INTEGER NOT NULL
);
  ]])

  Configured = true
end

if not Configured then 
  Configure()
end

Handlers.add("List", function (msg) 
  local todos = dbAdmin:select('select Id, Description, Complete from Todos where Owner = ?', {msg.From})
  print(require('json').encode(todos))
end)

Handlers.add("Add-Item", function (msg)
  dbAdmin:apply('insert into Todos (Owner, Description, Complete) values (?, ?, ?)', 
    { msg.From, msg.Data, 0 })  
  print("OK")
end)

Handlers.add("Complete", function (msg)
  dbAdmin:apply('update Todos set Complete = 1 where Id = ? and Owner = ?', { msg.Data, msg.From }) 
  print("OK")
end)

Handlers.add("Remove", function (msg) 
  dbAdmin:apply('delete from Todos where Id = ? and Owner = ?', { msg.Data, msg.From })
  print("OK")
end)
```

Load the blueprint in the terminal running AOS:

```bash
.load-blueprint apm
```
Install the @rakis/DbAdmin package:

```bash
APM.install('@rakis/DbAdmin')
```

You should receive a "Package has been loaded" confirmation.

Load the todos.lua file whenever you make changes:

```bash
.load api/todos.lua
```

Step 3: Setting Up the Frontend
Create a file named dal.js in the src folder and add the following code:

```js
import { message, result, createDataItemSigner, dryrun } from '@permaweb/aoconnect/dist/browser.js'

const PROCESS = "YOUR_PROCESS_ID"

function read(tags, options = {}) {
    return dryrun({
        process: PROCESS,
        data: "",
        tags: [
            { name: 'Data-Protocol', value: 'ao' },
            { name: 'Variant', value: 'ao.TN.1'},
            { name: 'Type', value: 'Message'},
            ...tags
        ],
        ...options
    }).then(res => res.Output.data)
}

function writeMessage(data, tags) {
    return message({
        process: PROCESS,
        signer: createDataItemSigner(arweaveWallet),
        data: data,
        tags: [
            { name: 'Data-Protocol', value: 'ao' },
            { name: 'Variant', value: 'ao.TN.1'},
            { name: 'Type', value: 'Message'},
            ...tags
        ]
    }).then(id => result({
        process: PROCESS,
        message: id
    })).then(res => res.Output.data)
}

// List Todos
export function list(user) {
    return read([
        {name: 'Action', value: 'List'}
    ], { Owner: user })
}

// Add Todo
export function add(description) {
    return writeMessage(description, [
        {name: 'Action', value: 'Add-Item'}
    ])
}

// Mark Complete
export function complete(id) {
    return writeMessage(id, [
        {name: 'Action', value: 'Complete'}
    ])    
}

// Remove Todo
export function remove(id) {
    return writeMessage(id, [
        {name: 'Action', value: 'Remove'}
    ])    
}
```

Replace YOUR_PROCESS_ID with your AO process ID. You can obtain this by typing the following in the terminal running AOS:

```bash
ao.id
```

Create a test wallet:

```bash
npx -y @permaweb/wallet > test.json
```

Initialize npm and install dependencies:

```bash
npm init -y
npm install @permaweb/aoconnect arweave 
```

## Step 4: Updating the Frontend
Edit the Home/index.js file with the following code:

```jsx
import { h } from 'preact'
import { useState } from 'preact/hooks'
import { add, list, complete, remove } from '../../dal' // Adjust this path as necessary

const Home = () => {
  const [newTodo, setNewTodo] = useState('')
  const [todos, setTodos] = useState([])
  const [walletAddress, setWalletAddress] = useState(null)

  const handleListTodos = async () => {
    const res = await list(walletAddress).then(r => JSON.parse(r))
    setTodos(res)
  }

  const handleCreateTodo = async () => {
    await add(newTodo).then(handleListTodos)
    setNewTodo('')
  }

  const handleToggleComplete = async (id) => {
    await complete(id.toString()).then(handleListTodos)
  }

  const handleDelete = async (id) => {
    await remove(id.toString()).then(handleListTodos)
  }

  const connectWallet = async () => {
    if (!walletAddress && window.arweaveWallet) {
      try {
        await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION'])
        const address = await window.arweaveWallet.getActiveAddress()
        setWalletAddress(address)
      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <div className="todo-app">
      <h1 className="who">Todo List</h1>
      <button onClick={connectWallet} disabled={!!walletAddress}>Connect Wallet</button>

      <div className="input-container">
        <input
          type="text"
          value={newTodo}
          onInput={(e) => setNewTodo(e.target.value)}
          placeholder="Enter a new todo"
          disabled={!walletAddress}
        />
        <button onClick={handleCreateTodo} disabled={!walletAddress}>Create Todo</button>
      </div>

      <button onClick={handleListTodos} disabled={!walletAddress}>List Todos</button>

      <ul className="todo-list">
        {!todos.length && 'No todos'}
        {todos?.map((todo, index) => (
          <li
            key={index}
            className={`todo-item ${todo.Complete ? 'completed' : ''}`}
          >
            <input
              type="checkbox"
              checked={todo.Complete}
              onClick={() => handleToggleComplete(todo.Id)}
            />
            <span>{todo.Description}</span>
            <button onClick={() => handleDelete(todo.Id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Home
```

Ensure the import path to dal.js is correct.

## Step 5: Adding Functionality
Connect Your Wallet:

The connectWallet function allows users to connect their Arweave wallet:
```js
const connectWallet = async () => {
  if (!walletAddress && window.arweaveWallet) {
    try {
      await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION'])
      const address = await window.arweaveWallet.getActiveAddress()
      setWalletAddress(address)
    } catch (e) {
      console.error(e)
    }
  }
}
```

List Todos:

The handleListTodos function fetches the todo list:
```js
const handleListTodos = async () => {
  const res = await list(walletAddress).then(r => JSON.parse(r))
  setTodos(res)
}
```

Create a Todo Item:

The handleCreateTodo function adds a new todo:
```js
const handleCreateTodo = async () => {
  await add(newTodo).then(handleListTodos)
  setNewTodo('')
}
```

Mark a Todo as Completed:

The handleToggleComplete function marks a todo as completed:
```js
const handleToggleComplete = async (id) => {
  await complete(id.toString()).then(handleListTodos)
}
```

Delete a Todo:

The handleDelete function deletes a todo:
```js
const handleDelete = async (id) => {
  await remove(id.toString()).then(handleListTodos)
}
```

## Step 6: Style Your App
Style the page as desired. You should now be able to:
Connect your wallet
List todos
Create new todos
Mark them as completed
Delete them

## Step 7: Deploying to the Permaweb
Install necessary packages:

```bash
npm install @permaweb/aoconnect arweave 
```
Create a test wallet:

```bash
npx -y @permaweb/wallet > test.json
```
Build your app:

```bash
npm run build
```

Set up the script to deploy your app in 'package.json'

```
{
    ...
    "scripts": {
        "deploy": DEPLOY_KEY=$(base64 -i test.json) npx -y permaweb-deploy --deploy-folder dist --ant-process none
        ...
    }
}
```
make sure the path to your wallet is correct.

Deploy your app to the Permaweb:

```bash
npm run deploy
```


Copy the Manifest ID from the output and paste it into your browser using the following format:
```plaintext
https://arweave.net/YOUR_MANIFEST_ID
```
You should now see your Preact app live on the Permaweb.
Congratulations!
You have successfully built and deployed a Preact Todo List app on the Permaweb!