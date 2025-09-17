import { render, screen } from '@testing-library/react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

// Mock the auth context
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', role: 'admin' },
    logout: jest.fn(),
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaUsers: () => <div data-testid="users-icon" />,
  FaUserMd: () => <div data-testid="doctor-icon" />,
  FaChartBar: () => <div data-testid="chart-icon" />,
  FaSignOutAlt: () => <div data-testid="signout-icon" />,
  FaBars: () => <div data-testid="bars-icon" />,
}));

describe('DashboardLayout', () => {
  it('renders children content', () => {
    render(
      <DashboardLayout>
        <div data-testid="test-content">Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders the sidebar with navigation items', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // Check for sidebar brand
    expect(screen.getByText('PHPF')).toBeInTheDocument();
    
    // Check for navigation links
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Pacientes')).toBeInTheDocument();
    expect(screen.getByText('Doctores')).toBeInTheDocument();
    
    // Check for logout button
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
  });

  it('renders the topbar by default', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('can hide the topbar when withTopbar is false', () => {
    render(
      <DashboardLayout withTopbar={false}>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('applies custom className to main content area', () => {
    const { container } = render(
      <DashboardLayout className="custom-class">
        <div>Content</div>
      </DashboardLayout>
    );

    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('custom-class');
  });

  it('has proper responsive layout structure', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // Check for main layout container
    const layoutContainer = container.querySelector('.flex.min-h-screen');
    expect(layoutContainer).toBeInTheDocument();

    // Check for responsive sidebar
    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('fixed', 'z-40', 'inset-y-0', 'left-0', 'w-64');

    // Check for main content area
    const mainContent = container.querySelector('main');
    expect(mainContent).toHaveClass('flex-1');
  });
});