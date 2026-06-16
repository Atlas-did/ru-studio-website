import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const stats = [
    { label: '作品数量', value: '6', labelEn: 'WORKS' },
    { label: '日志数量', value: '4', labelEn: 'JOURNAL' },
    { label: '待处理合作', value: '0', labelEn: 'PENDING' },
    { label: '网站访问', value: '1.2K', labelEn: 'VISITS' },
  ];

  const menuItems = [
    { label: '作品管理', labelEn: 'Works', path: '/admin/dashboard' },
    { label: '日志管理', labelEn: 'Journal', path: '/admin/dashboard' },
    { label: '内容编辑', labelEn: 'Content', path: '/admin/about' },
  ];

  return (
    <div className="min-h-[100dvh] bg-ink pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-serif text-display-m text-mist">管理后台</h1>
            <p className="text-overline text-stone mt-2">DASHBOARD</p>
          </div>
          <Link
            to="/"
            className="text-overline text-stone hover:text-mist transition-colors"
          >
            返回首页
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-border-subtle p-6">
              <div className="font-display text-3xl md:text-4xl text-mist mb-2">
                {stat.value}
              </div>
              <div className="text-overline text-stone">{stat.labelEn}</div>
              <div className="text-caption text-stone/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="group border border-border-subtle p-8 hover:border-mist/20 hover:bg-ink-light/30 transition-all duration-300"
            >
              <h3 className="font-serif text-h2 text-mist mb-1">{item.label}</h3>
              <p className="text-overline text-stone group-hover:text-mist/70 transition-colors">
                {item.labelEn}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
