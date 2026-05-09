export const Skeleton = ({ className = '', style = {} }) => (
  <div 
    className={`skeleton ${className}`} 
    style={{ 
      height: '1rem', 
      width: '100%', 
      margin: '8px 0',
      ...style 
    }} 
  />
);

export const CardSkeleton = () => (
  <div className="glass" style={{ padding: '24px' }}>
    <Skeleton style={{ height: '32px', width: '40%', marginBottom: '16px' }} />
    <Skeleton />
    <Skeleton />
    <Skeleton style={{ width: '80%' }} />
  </div>
);
