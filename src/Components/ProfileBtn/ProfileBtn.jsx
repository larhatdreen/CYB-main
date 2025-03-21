import React from 'react'
import { useNavigate } from 'react-router-dom'
import './ProfileBtn.css'

import avatar from '../../Assets/nav/user.svg'

export default function ProfileBtn({ level, user_photo }) {
  const navigate = useNavigate()
  console.log(level)
  return (
    <button 
      className='profileBtn' 
      onClick={() => navigate('/profile')}
      style={{borderColor: level === 'Профи' ? '#A799FF' : ''}}
    >
        <img src={user_photo ? user_photo : avatar} alt="аватар" style={{transform: user_photo ? '' : 'scale(0.7)'}}/>
        <div className="profileEllips"
          style={{background: level === 'Профи' ? '#A799FF' : ''}}
        ></div>
    </button>
  )
}
