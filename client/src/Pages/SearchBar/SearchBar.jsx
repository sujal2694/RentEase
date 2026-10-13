import React, { useContext, useEffect, useState } from 'react'
import './SearchBar.css'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productPath } from '../../utils/productUrl'

const SearchBar = () => {
    const { searchBar, setSearchBar, url } = useContext(StoreContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState([]);
    const filteredData = data.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(url + '/api/product/list');
                if (!response.data.success || !Array.isArray(response.data.data)) {
                    throw new Error(response.data.message || "Unable to search the rental catalog");
                }
                setData(response.data.data);
            } catch (error) {
                console.error("Failed to search rental catalog", error);
                toast.error("Unable to search the rental catalog");
            }
        };
        fetchData();
    }, [url]);

    return (
        <div className={searchBar ? "search-bar" : "hidden"} role="search" aria-label="Search rentals">
            <div className="input-box">
                <input
                    onChange={(e) => setSearchTerm(e.target.value)}
                    type="search"
                    value={searchTerm}
                    placeholder='Search here...'
                    aria-label="Search rental items"
                />
                {filteredData.length > 0 ?
                    <div className={searchTerm !== "" ? "search-results" : "hidden"} role="region" aria-label="Rental search results">
                        <ul>
                            {filteredData.map((item) => (
                                <li key={item._id}><Link to={productPath(item)} onClick={() => { setSearchBar(false); setSearchTerm("") }}>{item.name}</Link></li>
                            ))}
                        </ul>


                    </div>
                    : ""
                }
            </div>
            <div className='close-btn'>
                <button type="button" onClick={() => setSearchBar(false)} aria-label="Close rental search"><i className='bx bx-x' aria-hidden="true"></i></button>
            </div>
        </div>
    )
}

export default SearchBar