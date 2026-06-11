import React, { useEffect, useState } from 'react';
import { Form, Dropdown } from 'react-bootstrap';
import { getCountryNameList} from '../api/countryApi';

export default function CountrySelector({ value, onChange, disableLabel=false }) {
  const [options, setOptions] = useState([]);
  const [countryFlags, setCountryFlags] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        await getCountryNameList()
        const countries = JSON.parse(localStorage.getItem("countries"))
        const names = []
        for (let i = 0; i < countries.length; i ++){
          names.push(countries[i].name)
        }
        let flagUrl = null

        const flagPromises = names.map(async (name) => {
          try {
            countries.forEach(el => {
              if (el.name === name){
                flagUrl = `https://geoapi.info/flags/1x1/${el.code.toLowerCase()}.svg`
              }
            });
            return { name, flagUrl };
          } catch (error) {
            console.error(`Error fetching flag for ${name}:`, error);
            return { name, flagUrl: null };
          }
        });

        const flagsResults = await Promise.all(flagPromises);

        const flagsMap = {};
        flagsResults.forEach(item => {
          flagsMap[item.name] = item.flagUrl;
        });

        if (mounted) {
          setCountryFlags(flagsMap);
          setOptions(names || []);
        }
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
      {!disableLabel && <Form.Label className="fw-semibold">Select your Country</Form.Label>}
      
      <Dropdown onSelect={(selectedValue) => onChange(selectedValue)} className="w-100">
        <Dropdown.Toggle 
          variant="outline-secondary" 
          id="dropdown-country"
          className="w-100 d-flex align-items-center justify-content-between text-start"
          style={{ 
            borderColor: '#dee2e6',
            color: value ? '#4a5058' : '#6c7279'
          }}
        >
          <span className="d-flex align-items-center">
            {value && countryFlags[value] && (
              <img 
                src={countryFlags[value]} 
                alt="" 
                style={{ width: '20px', height: '15px', marginRight: '10px', objectFit: 'cover' }} 
              />
            )}
            {value || "-- Select country --"}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-100" style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {loading && (
            <Dropdown.Item disabled className="text-muted">
              Loading countries...
            </Dropdown.Item>
          )}
          
          {!loading && options.map((name) => (
            <Dropdown.Item 
              key={name} 
              eventKey={name} 
              active={value === name}
              className="d-flex align-items-center"
            >
              {countryFlags[name] && (
                <img 
                  src={countryFlags[name]} 
                  alt={`${name} flag`} 
                  style={{ width: '20px', height: '15px', marginRight: '10px', objectFit: 'cover' }} 
                />
              )}
              <span>{name}</span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </Form.Group>
  );
}