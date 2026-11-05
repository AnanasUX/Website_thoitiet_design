import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("ErrorBoundary caught an error:", error, info);
  }

  handleReload = () => {
    try {
      delete sessionStorage.redirect;
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f4f6fa',
          fontFamily: "'Inter', sans-serif",
          padding: '20px',
          color: '#182033'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e3e7ef',
            boxShadow: '0 20px 45px -10px rgba(0,0,0,0.1)',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              margin: '0 auto 16px'
            }}>
              ⚡
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px', color: '#182033' }}>
              Đang làm mới hệ thống
            </h2>
            <p style={{ fontSize: '13.5px', color: '#5f687b', margin: '0 0 24px', lineHeight: 1.5 }}>
              Một số dữ liệu hiển thị vừa được cập nhật. Nhấn vào nút bên dưới để khôi phục trạng thái hoạt động mượt mà.
            </p>

            <button
              onClick={this.handleReload}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563ff 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,255,0.3)',
                transition: 'opacity 0.2s'
              }}
            >
              🔄 Khôi Phục &amp; Tải Lại Trang
            </button>

            {this.state.error && (
              <details style={{ marginTop: '20px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', cursor: 'pointer' }}>
                <summary>Chi tiết lỗi kỹ thuật</summary>
                <pre style={{ marginTop: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px', overflowX: 'auto', border: '1px solid #e2e8f0', color: '#64748b' }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
