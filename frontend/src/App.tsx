import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import AddSnippet from './pages/AddSnippet';
import SnippetDetail from './pages/SnippetDetail';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="add" element={<AddSnippet />} />
          <Route path="snippet/:id" element={<SnippetDetail />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
