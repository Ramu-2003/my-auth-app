import React, { useState } from 'react';
import './TermsAndConditions.css';
import LoadingScreen from './LoadingScreen';

const TermsAndConditions = ({ onAccept, onDecline }) => {
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  // The Accept button is only enabled if BOTH checkboxes are checked
  const isAcceptEnabled = isChecked1 && isChecked2;

  const handleAccept = () => {
    setShowLoading(true);
  };

  const handleLoadingComplete = () => {
    onAccept();
  };

  // Show loading screen after Accept is clicked
  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} duration={30000} />;
  }

  return (
    <div className="tc-page-container">
      <div className="tc-card">
        <h1 className="tc-title">TERMS & CONDITIONS</h1>
        
        <div className="tc-content-wrapper">
          <div className="tc-left-side">
            <div className="tc-text-box">
              <p>
                Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry . 
                Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever Since The 1500n 
                An Unknown Printer Took A Galley Ofas Popularised In The 1960s With The Release 
                Of Letraset Sheets Containing Lorem Ipsum Passages, And More Recently With Desktop 
                Publishing Software Like Aldus PageMakr Including Versions Of Lorem Ipsum.
              </p>
              <br/>
              <p>
                Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry . 
                Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever Since The 1500n 
                An Unknown Printer Took A Galley Ofas Popularised In The 1960s With The Release 
                Of Letraset Sheets Containing Lorem Ipsum Passages, And More Recently With Desktop 
                Publishing Software Like Aldus PageMakr Including Versions Of Lorem Ipsum.
              </p>
              <br/>
              <p>
                 Keep adding your actual terms and conditions text here. The box will 
                 automatically become scrollable once the text exceeds the height of the container.
              </p>
            </div>

            <div className="tc-checkbox-group">
              <label className="tc-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={isChecked1} 
                  onChange={(e) => setIsChecked1(e.target.checked)} 
                />
                <span>Yes , I agree to the Terms of service</span>
              </label>

              <label className="tc-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={isChecked2} 
                  onChange={(e) => setIsChecked2(e.target.checked)} 
                />
                <span>Just put random text</span>
              </label>
            </div>

            <div className="tc-button-group">
              <button className="tc-btn-decline" onClick={onDecline}>
                ✕ NOT ACCEPT
              </button>
              <button 
                className={`tc-btn-accept ${isAcceptEnabled ? '' : 'disabled'}`} 
                disabled={!isAcceptEnabled}
                onClick={handleAccept}
              >
                O ACCEPT
              </button>
            </div>
          </div>

          <div className="tc-right-side">
            <img 
              src="/assets/TERMS-CONDITIONS.png" 
              alt="Terms and Conditions Illustration" 
              className="tc-image" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
