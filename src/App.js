import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input, Select, Button, Card, Typography, Space } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const FIELD_TYPES = [
  'string',
  'number',
  'boolean',
  'float',
  'objectID',
  'array',
  'nested'
];

const create = () => ({
  id: uuidv4(),
  key: '',
  type: 'string',
  children: []
});

function App() {
  const [fields, setFields] = useState([create()]);

  const update = (id, prop, value, currentFields = fields) => {
    const updated = currentFields.map(field => {
      if (field.id === id) {
        const updatedField = { ...field, [prop]: value };
        if (prop === 'type' && value === 'nested') {
          updatedField.children = [create()];
        } else if (prop === 'type') {
          updatedField.children = [];
        }
        return updatedField;
      } else if (field.children.length > 0) {
        return {
          ...field,
          children: update(id, prop, value, field.children)
        };
      }
      return field;
    });
    setFields(updated);
    return updated;
  };

  const addField = (parentId = null) => {
    const newField = create();
    if (!parentId) {
      setFields([...fields, newField]);
    } else {
      const addNestedField = (currentFields) =>
        currentFields.map(field => {
          if (field.id === parentId) {
            return {
              ...field,
              children: [...field.children, newField]
            };
          } else if (field.children.length > 0) {
            return {
              ...field,
              children: addNestedField(field.children)
            };
          }
          return field;
        });
      setFields(addNestedField(fields));
    }
  };

  const deleteField = (id, currentFields = fields) => {
    const updated = currentFields
      .filter(field => field.id !== id)
      .map(field => {
        if (field.children.length > 0) {
          return {
            ...field,
            children: deleteField(id, field.children)
          };
        }
        return field;
      });
    return updated;
  };

  const onDelete = (id) => {
    setFields(deleteField(id));
  };

  const generateJSON = (currentFields) => {
    const obj = {};
    currentFields.forEach(field => {
      if (!field.key) return;
      if (field.type === 'nested') {
        obj[field.key] = generateJSON(field.children);
      } else {
        obj[field.key] = field.type;
      }
    });
    return obj;
  };

  const render = (currentFields, parentId = null) =>
    currentFields.map(field => (
      <Card key={field.id} style={{ marginTop: 16, marginLeft: parentId ? 24 : 0 }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Input
            placeholder="Field Key"
            value={field.key}
            onChange={(e) => update(field.id, 'key', e.target.value)}
            style={{ flex: 1, minWidth: 120 }}
          />
          <Select
            value={field.type}
            onChange={(value) => update(field.id, 'type', value)}
            style={{ flex: 1, minWidth: 120 }}
          >
            {FIELD_TYPES.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
          {field.type === 'nested' && (
            <Button onClick={() => addField(field.id)}>+ Add Nested</Button>
          )}
          <Button danger onClick={() => onDelete(field.id)} style={{ fontSize: 20, padding: '0 10px' }}>×</Button>
        </div>
        {field.children.length > 0 && render(field.children, field.id)}
      </Card>
    ));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <Title level={3}>JSON Schema Builder</Title>
          {render(fields)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            <Button type="primary" onClick={() => addField()}>+ Add Field</Button>
            <Button type="default">Submit</Button>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 300 }}>
          <Title level={4}>Generated JSON:</Title>
          <pre style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 4, maxHeight: 600, overflow: 'auto' }}>
            {JSON.stringify(generateJSON(fields), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
