import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { getCountryNameList } from '../api/countryApi';

export default function CountrySelector({ value, onChange }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const names = await getCountryNameList();
        if (mounted) setOptions(names || []);
      } catch (e) {
        console.error('Failed to load country names', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Form.Group className="mb-3" controlId="formCountrySelect">
      <Form.Label>Select your Country</Form.Label>
      <Form.Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- Select country --</option>
        {loading && <option disabled>Loading...</option>}
        {options.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}
