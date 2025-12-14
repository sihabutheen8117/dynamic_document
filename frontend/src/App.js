import { useState , useEffect } from 'react';
import { Search, Download, X } from 'lucide-react';
import axios from 'axios' ;
import { useQuery } from "@tanstack/react-query";


function App() {



  // Sample JSON data
  // const itemsData = [
  //   {"item_code":"41:4104:41043","desc":"Termites Insect (Pest Control) Treatment. Scope of Works: \n*drill and inject the door frame with pesticide\n*The new frame will be treated and spray with anti-termite protection material\n*Spray pesticide","qty":1,"u_price":337.96,"t_price":337.96},
  //   {"item_code":"41:4103:410305","desc":"Cleaning work - G Floor villa (inside only)","qty":1,"u_price":1275.0,"t_price":1275.0},
  //   {"item_code":"41:4103:410306","desc":"Cleaning work- 1st Floor villa (inside only)","qty":1,"u_price":1325.0,"t_price":1325.0},
  //   {"item_code":"41:4103:410307","desc":"G+1 villa full Cleaning (inside & outside)","qty":1,"u_price":2782.5,"t_price":2782.5},
  //   {"item_code":"41:4103:410308","desc":"Swimming pool cleaning","qty":1,"u_price":447.03,"t_price":447.03},
  //   {"item_code":"41:4103:410309","desc":"Swimming pool water refilling / 5000 Gallons","qty":1,"u_price":1450.0,"t_price":1450.0},
  //   {"item_code":"41:4103:410310","desc":"Floor tiles Acid cleaning/ price per square meter","qty":1,"u_price":12.5,"t_price":12.5},
  //   {"item_code":"41:4103:410311","desc":"Deep Cleaning (Studio)","qty":1,"u_price":252.0,"t_price":252.0},
  //   {"item_code":"41:4103:410312","desc":"Deep Cleaning (1BR)","qty":1,"u_price":346.5,"t_price":346.5},
  //   {"item_code":"41:4103:410313","desc":"Deep Cleaning (2BR)","qty":1,"u_price":420.0,"t_price":420.0},
  //   {"item_code":"41:4103:410314","desc":"Deep Cleaning (Commercial, Office & Retail)","qty":1,"u_price":472.5,"t_price":472.5},
  //   {"item_code":"41:4103:410315","desc":"G+1 villa Deep Cleaning (inside & outside) scrubbing chemical & jet washing, windows glass","qty":1,"u_price":525.0,"t_price":525.0}
  // ];

  const [itemsData, setitemsData] = useState([]);

  useEffect(() => {
    fetch("/data/cleaned_items.json")   // relative to public folder
      .then((res) => res.json())
      .then((json) => setitemsData(json))
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  const [formData, setFormData] = useState({
    work_order_no: '',
    client_req_no: '',
    box_no: '',
    searchType: 'code',
    work_req : ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateQuantity = (item_code, newData) => {

    setSelectedItems(prev =>
      prev.map(item =>
        item.item_code === item_code ? { ...item, ...newData , t_price : (item.u_price*newData.qty) } : item
      )
    );
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = itemsData.filter(item => {
      if (formData.searchType === 'code') {
        return item.item_code.toLowerCase().includes(query.toLowerCase());
      } else {
        return item.desc.toLowerCase().includes(query.toLowerCase());
      }
    });

    setSearchResults(results);
    setShowResults(true);
  };

  const addItem = (item) => {
    const isAlreadyAdded = selectedItems.some(selected => selected.item_code === item.item_code);
    if (!isAlreadyAdded) {
      setSelectedItems([...selectedItems, item]);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    console.log( selectedItems )
  };

  const removeItem = (itemCode) => {
    setSelectedItems(selectedItems.filter(item => item.item_code !== itemCode));
  };

  const downloadQuotation = async () => {
    try {

      const updated = selectedItems.map((item, index) => ({
        ...item,
        sl_no: index + 1
      }));

      const data = {
        ...formData ,
        items : updated
      }

      //http://localhost:4000
      //https://dynamic-document-server.onrender.com/quotation

      const res = await axios.post("https://dynamic-document-server.onrender.com/quotation", 
        {
          ...data
        },
        {
        responseType: "blob", 
        headers: {
          "Content-Type": "application/json",
        },   // IMPORTANT
      });
  
      console.log(res)
  
      // Create a URL for the file blob
      const fileURL = window.URL.createObjectURL(new Blob([res.data]));

      const now = new Date();

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");

      const file_name = "NBC-" + year +"-"+month+"-" + formData.client_req_no + "-KH" 
  
      // Create a temporary link and click it
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `"${file_name}".docx`); 
      document.body.appendChild(link);
      link.click();
  
      link.remove();
      window.URL.revokeObjectURL(fileURL);
  
    } catch (err) {
      console.error("Download error:", err);
    }
  };


  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .form-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 40px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .form-title {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          text-align: center;
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #555;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          outline: none;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-wrapper {
          position: relative;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-input {
          padding-left: 45px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          pointer-events: none;
          z-index: 1;
        }

        .radio-group {
          display: flex;
          gap: 30px;
          margin-top: 10px;
        }

        .radio-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 14px;
          color: #555;
        }

        .radio-input {
          width: 18px;
          height: 18px;
          margin-right: 8px;
          cursor: pointer;
          accent-color: #667eea;
        }

        .selected-items {
          margin-bottom: 20px;
        }

        .selected-items-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }

        .selected-count {
          background: #667eea;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
        }

        .selected-item {
          background: #f8f9ff;
          border: 2px solid #e0e7ff;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: start;
          transition: all 0.2s ease;
        }

        .selected-item:hover {
          border-color: #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
        }

        .item-info {
          flex: 1;
        }

        .item-code {
          font-size: 13px;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 4px;
        }

        .item-desc {
          font-size: 13px;
          color: #666;
          line-height: 1.5;
          white-space: pre-line;
        }

        .item-price {
          font-size: 12px;
          color: #22c55e;
          font-weight: 600;
          margin-top: 6px;
        }

        .remove-btn {
          background: #ff4757;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          margin-left: 12px;
          flex-shrink: 0;
        }

        .remove-btn:hover {
          background: #ee2e3c;
          transform: scale(1.1);
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #667eea;
          border-top: none;
          border-radius: 0 0 8px 8px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 10;
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
        }

        .search-result-item {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .search-result-item:hover {
          background: #f8f9ff;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .result-code {
          font-size: 12px;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 4px;
        }

        .result-desc {
          font-size: 13px;
          color: #555;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .no-results {
          padding: 16px;
          text-align: center;
          color: #999;
          font-size: 14px;
        }

        .download-button {
          width: 100%;
          background: #667eea;
          color: white;
          font-size: 16px;
          font-weight: 600;
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 30px;
          transition: all 0.3s ease;
        }

        .download-button:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .download-button:active {
          transform: translateY(0);
        }

        .download-button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          transform: none;
        }


        /* Selected Items Container */
.selected-items {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Header Section */
.selected-items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.selected-items-header .form-label {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.selected-count {
  background: #0d6efd;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

/* Table Styles */
.items-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.items-table thead {
  background: #f8f9fa;
}

.items-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.items-table tbody tr {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.15s ease;
}

.items-table tbody tr:hover {
  background: #f8f9fa;
}

.items-table tbody tr:last-child {
  border-bottom: none;
}

.items-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #212529;
}

/* Quantity Input */
.qty-input {
  width: 70px;
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.qty-input:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

/* Remove Button */
.remove-btn {
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.remove-btn:hover {
  background: #ffe6e8;
  color: #c82333;
}

/* Responsive Design */
@media (max-width: 768px) {
  .items-table {
    font-size: 12px;
  }
  
  .items-table th,
  .items-table td {
    padding: 10px 12px;
  }
  
  .qty-input {
    width: 60px;
    padding: 4px 8px;
  }
}
      `}</style>

      <div className="container">
        <div className="form-card">
          <h2 className="form-title">Document Search</h2>
          
          <div className="form-group">
            <label htmlFor="work_order_no" className="form-label">Work Order Number</label>
            <input
              type="text"
              id="work_order_no"
              name="work_order_no"
              value={formData.work_order_no}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter Work Order Number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="client_req_no" className="form-label">Location of the Work</label>
            <input
              type="text"
              id="client_req_no"
              name="client_req_no"
              value={formData.client_req_no}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter Client Request Number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="box_no" className="form-label">Box Number</label>
            <input
              type="text"
              id="box_no"
              name="box_no"
              value={formData.box_no}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter Box Number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="work_req" className="form-label">Name of the Work Requester</label>
            <input
              type="text"
              id="work_req"
              name="work_req"
              value={formData.work_req}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter Box Number"
            />
          </div>

          {selectedItems.length > 0 && (
            <div className="selected-items">
              <div className="selected-items-header">
                <label className="form-label" style={{marginBottom: 0}}>Selected Items</label>
                <span className="selected-count">{selectedItems.length}</span>
              </div>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item) => (
                    <tr key={item.item_code}>
                      <td>{item.item_code}</td>
                      <td>{item.desc}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateQuantity(item.item_code, { qty : parseInt(e.target.value) || 0} ) }
                          className="qty-input"
                        />
                      </td>
                      <td>${item.u_price.toFixed(2)}</td>
                      <td>${(item.t_price).toFixed(2)}</td>
                      <td>
                        <button
                          onClick={() => removeItem(item.item_code)}
                          className="remove-btn"
                          title="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Search By</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="searchType"
                  value="code"
                  checked={formData.searchType === 'code'}
                  onChange={handleInputChange}
                  className="radio-input"
                />
                Code
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="searchType"
                  value="name"
                  checked={formData.searchType === 'name'}
                  onChange={handleInputChange}
                  className="radio-input"
                />
                Name
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="searchQuery" className="form-label">
              Search {formData.searchType === 'code' ? 'Code' : 'Name'}
            </label>
            <div className="search-wrapper">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  id="searchQuery"
                  name="searchQuery"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="form-input search-input"
                  placeholder={`Enter ${formData.searchType === 'code' ? 'code' : 'name'} to search`}
                />
              </div>
              {showResults && (
                <div className="search-results">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <div
                        key={item.item_code}
                        className="search-result-item"
                        onClick={() => addItem(item)}
                      >
                        <div className="result-code">{item.item_code}</div>
                        <div className="result-desc">{item.desc}</div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">No items found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button onClick={downloadQuotation} className="download-button">
            <Download size={20} />
            Download Document
          </button>
        </div>
      </div>
    </>
  );
}

export default App;