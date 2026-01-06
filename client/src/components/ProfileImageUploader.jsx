import React from 'react';
import Image from 'react-bootstrap/Image';
import hoveredDefaultProfilePic from '../assets/hovered_default_Profilepic.png';

export default function ProfileImageUploader({ profileImage, setProfileImage, fileInputRef }) {
  const [imgHover, setImgHover] = React.useState(false);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setProfileImage(event.target?.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Image
        src={imgHover ? hoveredDefaultProfilePic : profileImage}
        alt="Profile"
        roundedCircle
        onMouseEnter={() => setImgHover(true)}
        onMouseLeave={() => setImgHover(false)}
        onClick={handleImageClick}
        style={{
          width: '150px',
          height: '150px',
          objectFit: 'cover',
          transition: 'transform .18s ease, box-shadow .18s ease',
          transform: imgHover ? 'scale(1.08)' : 'scale(1)',
          boxShadow: imgHover ? '0 6px 18px rgba(0,0,0,0.25)' : 'none',
          cursor: 'pointer'
        }}
      />
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
