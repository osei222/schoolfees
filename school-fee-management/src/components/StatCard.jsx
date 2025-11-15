import { Card } from 'react-bootstrap';

const StatCard = ({ title, value, icon: Icon, bgColor, textColor, subtitle }) => {
  const gradients = {
    'bg-primary': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    'bg-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'bg-warning': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'bg-info': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    'bg-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  };

  return (
    <Card className="stat-card-elite stat-card-hover" style={{ height: '100%' }}>
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <p className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
              {title}
            </p>
            <h5 className="fw-bold mb-1" style={{ fontSize: '1.25rem', color: '#1e293b' }}>
              {value}
            </h5>
            {subtitle && (
              <p className="mb-0" style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {subtitle}
              </p>
            )}
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: gradients[bgColor] || bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.2)',
            flexShrink: 0
          }}>
            <Icon size={20} color="white" />
          </div>
        </div>
      </Card.Body>
      
      {/* Decorative gradient overlay */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: gradients[bgColor] || bgColor }} />
    </Card>
  );
};

export default StatCard;
