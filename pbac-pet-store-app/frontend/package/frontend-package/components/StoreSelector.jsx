import React from 'react';
import styles from '../styles/Home.module.css';

export default function StoreSelector({ storeId, setStoreId }) {
  return (
    <div className={styles.buttonContainer} style={{ 
      backgroundColor: '#f0f0f0', 
      padding: '15px', 
      borderRadius: '8px', 
      marginBottom: '20px', 
      border: '2px solid #ccc',
      display: 'block',
      width: '100%'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}><b>Store Selection</b></h3>
      <div className={styles.formRow} style={{ 
        backgroundColor: '#e0e0e0', 
        padding: '10px', 
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <label htmlFor="storeId" style={{ fontWeight: 'bold', marginRight: '10px' }}>Select Store ID:</label>
        <select
          id="storeId"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          required
          style={{ 
            padding: '8px', 
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '120px',
            fontSize: '16px'
          }}
        >
          <option value="1">Store 1</option>
          <option value="2">Store 2</option>
          <option value="3">Store 3</option>
        </select>
      </div>
      <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#555' }}>
        <i>You must select a store ID before making any API calls.</i>
      </p>
    </div>
  );
}