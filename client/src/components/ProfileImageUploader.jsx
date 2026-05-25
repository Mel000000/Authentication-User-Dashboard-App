import React from 'react';
import Image from 'react-bootstrap/Image';

export default function ProfileImageUploader({ profileImage, setProfileImage, setProfileImageFile, fileInputRef, extraStyles = {} }) {
  const [imgHover, setImgHover] = React.useState(false);
  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => setProfileImage(event.target?.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <div
        onMouseEnter={() => setImgHover(true)}
        onMouseLeave={() => setImgHover(false)}
        onClick={handleImageClick}
        style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          cursor: 'pointer',
          overflow: 'hidden', 
          transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease',
          transform: imgHover ? 'scale(1.05)' : 'scale(1)',
          boxShadow: imgHover 
            ? '0 10px 25px rgba(0,0,0,0.15), 0 0 0 4px rgba(0, 123, 255, 0.2)' // Fancy outer ring on hover
            : '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >

        <Image
          src={profileImage}
          alt="Profile"
          roundedCircle
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'filter 0.3s ease',
            filter: imgHover ? 'blur(1px) brightness(0.8)' : 'none', // Slightly dims/blurs background image
            ...extraStyles
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark tint
            opacity: imgHover ? 1 : 0, // Fades in/out
            transition: 'opacity 0.3s ease',
            color: '#fff',
          }}
        >
  
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="22" 
            height="22" 
            fill="currentColor" 
            viewBox="0 0 16 16"
            style={{
              transform: imgHover ? 'translateY(0)' : 'translateY(10px)',
              transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
              marginBottom: '4px'
            }}
          >
            <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
            <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"/>
          </svg>
          
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '600', 
            letterSpacing: '0.5px',
            transform: imgHover ? 'translateY(0)' : 'translateY(10px)',
            transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1) 0.05s', // Slight delay for stagger effect
          }}>
            EDIT
          </span>
        </div>
      </div>


      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
