import React, { useState, useRef } from 'react';
import { Form, Button, ProgressBar, Alert } from 'react-bootstrap';
import { Upload } from 'react-bootstrap-icons';

const FileUpload = ({ onFileSelect, accept = '*' }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (onFileSelect) {
        onFileSelect(selectedFile);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <Form.Group>
        <Form.Control
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="d-none"
        />
        
        <Button
          variant="outline-secondary"
          onClick={handleClick}
          className="w-100"
        >
          <Upload className="me-2" />
          {file ? file.name : 'Выберите файл'}
        </Button>
        
        {uploading && (
          <ProgressBar
            animated
            now={progress}
            label={`${progress}%`}
            className="mt-2"
          />
        )}
      </Form.Group>
      
      {file && (
        <div className="mt-2">
          <small className="text-muted">
            Размер: {(file.size / 1024 / 1024).toFixed(2)} MB
          </small>
        </div>
      )}
    </div>
  );
};

export default FileUpload;