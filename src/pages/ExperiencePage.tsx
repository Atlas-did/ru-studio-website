import { useParams, Link } from 'react-router-dom';
import BambooScrollWriter from '@/components/interactive/BambooScrollWriter';
import LiYiStarMap from '@/components/interactive/LiYiStarMap';
import RuYiColorCard from '@/components/interactive/RuYiColorCard';
import RubbingReveal from '@/components/interactive/RubbingReveal';

const pages: Record<string, { component: React.ComponentType; title: string }> = {
  'write': { component: BambooScrollWriter, title: '竹简书写' },
  'liyi': { component: LiYiStarMap, title: '六艺星图' },
  'color': { component: RuYiColorCard, title: '儒意色卡' },
  'rubbing': { component: RubbingReveal, title: '拓片体验' },
};

export default function ExperiencePage() {
  const { id } = useParams<{ id: string }>();
  const page = id ? pages[id] : null;

  if (!page) {
    return (
      <div className="min-h-screen bg-ink pt-32 px-6 text-center">
        <h1 className="font-serif text-display-l text-mist mb-4">体验未找到</h1>
        <Link to="/" className="text-caption-s text-stone hover:text-mist transition-colors">← 返回首页</Link>
      </div>
    );
  }

  const Comp = page.component;
  return <Comp />;
}
