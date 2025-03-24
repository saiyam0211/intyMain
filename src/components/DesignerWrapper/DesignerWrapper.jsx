import React from 'react';
import Designers from '../Designers/Designers'; // Adjust the import path as needed

const DesignersWrapper = ({ hideHeadings = false }) => {
  // Use CSS to conditionally hide the headings
  return (
    <>
      {hideHeadings && (
        <style jsx global>{`
          section > div > h3,
          section > div > h2 {
            display: none;
          }
        `}</style>
      )}
      <Designers />
    </>
  );
};

export default DesignersWrapper;