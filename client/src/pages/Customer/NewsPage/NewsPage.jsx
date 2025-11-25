import { useEffect, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb/Breadcrumb";
import Headline from "@/components/common/Headline/Headline";
import Button from "@/components/common/Button/Button";
import { Calendar, Clock, Eye, User, ArrowRight, Search, Tag } from "lucide-react";
import PropTypes from "prop-types";
import formatDate from "@/utils/format/formatDate";

// Mock data cho tin tức
const mockNewsData = {
  featured: {
    id: 1,
    title: "Xu hướng thời trang Thu Đông 2024: Khám phá phong cách mới",
    excerpt:
      "Những xu hướng thời trang hot nhất mùa Thu Đông 2024 với sự kết hợp hoàn hảo giữa phong cách cổ điển và hiện đại.",
    content: "Thời trang Thu Đông 2024 mang đến những xu hướng mới mẻ với sự kết hợp tinh tế...",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    author: "Nguyễn Thị Lan",
    publishDate: "2024-05-25",
    readTime: "5 phút",
    views: 1240,
    category: "Xu hướng",
    tags: ["Thời trang", "Thu Đông 2024", "Xu hướng"],
  },
  articles: [
    {
      id: 2,
      title: "Cách phối đồ công sở thanh lịch cho phái nữ",
      excerpt:
        "Hướng dẫn chi tiết cách phối đồ công sở chuyên nghiệp và thanh lịch phù hợp với môi trường làm việc hiện đại.",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80",
      author: "Trần Văn Nam",
      publishDate: "2024-05-20",
      readTime: "4 phút",
      views: 856,
      category: "Phối đồ",
      tags: ["Công sở", "Phong cách"],
    },
    {
      id: 3,
      title: "Top 10 món phụ kiện không thể thiếu trong tủ đồ",
      excerpt: "Khám phá những món phụ kiện thiết yếu giúp bạn tạo nên phong cách riêng và nâng tầm outfit.",
      image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&q=80",
      author: "Lê Thị Mai",
      publishDate: "2024-05-18",
      readTime: "6 phút",
      views: 1450,
      category: "Phụ kiện",
      tags: ["Phụ kiện", "Thời trang"],
    },
    {
      id: 4,
      title: "Bí quyết chọn trang phục phù hợp với dáng người",
      excerpt: "Tìm hiểu cách chọn trang phục phù hợp với từng dáng người để tôn lên những ưu điểm của bạn.",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
      author: "Phạm Văn Hùng",
      publishDate: "2024-05-15",
      readTime: "7 phút",
      views: 920,
      category: "Hướng dẫn",
      tags: ["Dáng người", "Tư vấn"],
    },
    {
      id: 5,
      title: "Thời trang bền vững: Xu hướng của tương lai",
      excerpt: "Tìm hiểu về phong trào thời trang bền vững và tác động tích cực đến môi trường.",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80",
      author: "Nguyễn Thị Hoa",
      publishDate: "2024-05-12",
      readTime: "5 phút",
      views: 1120,
      category: "Xu hướng",
      tags: ["Bền vững", "Môi trường"],
    },
    {
      id: 6,
      title: "Làm sao để bảo quản quần áo đúng cách?",
      excerpt: "Hướng dẫn chi tiết cách bảo quản và chăm sóc quần áo để giữ được chất lượng và độ bền.",
      image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&q=80",
      author: "Vũ Thị Lan",
      publishDate: "2024-05-10",
      readTime: "4 phút",
      views: 780,
      category: "Hướng dẫn",
      tags: ["Bảo quản", "Chăm sóc"],
    },
    {
      id: 7,
      title: "Phong cách street style đang được yêu thích",
      excerpt: "Khám phá phong cách street style năng động và cách ứng dụng vào trang phục hàng ngày.",
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
      author: "Trần Minh Tuấn",
      publishDate: "2024-05-08",
      readTime: "6 phút",
      views: 1680,
      category: "Phong cách",
      tags: ["Street style", "Năng động"],
    },
  ],
};

const newsCategories = [
  { id: 1, name: "Tất cả", slug: "all", count: 15 },
  { id: 2, name: "Xu hướng", slug: "trend", count: 5 },
  { id: 3, name: "Phối đồ", slug: "styling", count: 4 },
  { id: 4, name: "Phụ kiện", slug: "accessories", count: 3 },
  { id: 5, name: "Hướng dẫn", slug: "guide", count: 2 },
  { id: 6, name: "Phong cách", slug: "style", count: 1 },
];

const popularTags = [
  "Thời trang",
  "Xu hướng",
  "Phối đồ",
  "Phụ kiện",
  "Công sở",
  "Street style",
  "Thu Đông 2024",
  "Bền vững",
  "Chăm sóc",
];

function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  useEffect(() => {
    document.title = "Tin tức | Outfitory";
  }, []);

  // Featured Article Component
  const FeaturedArticle = ({ article }) => (
    <div className="relative overflow-hidden rounded-sm bg-white shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative h-64 lg:h-full">
          <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-primaryColor px-3 py-1 text-xs font-medium text-white">Nổi bật</span>
          </div>
        </div>
        <div className="p-4 lg:p-6">
          <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
            <span className="rounded-sm bg-blue-100 px-2 py-1 text-blue-700">{article.category}</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(article.publishDate)}
            </div>
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 lg:text-3xl">{article.title}</h2>
          <p className="mb-6 leading-relaxed text-gray-600">{article.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {article.author}
              </div>
              {/* <div className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                {article.readTime}
              </div> */}
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views}
              </div>
            </div>
            <Button variant="ghost" className="flex items-center gap-2">
              Đọc tiếp <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Article Card Component
  const ArticleCard = ({ article }) => (
    <div className="group overflow-hidden rounded-sm bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="relative overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded-sm bg-white/90 px-2 py-1 text-xs font-medium text-gray-700">{article.category}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="mb-3 text-lg font-semibold text-gray-900 transition-colors group-hover:text-primaryColor">
          {article.title}
        </h3>
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.author}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(article.publishDate)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* <div className='flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              {article.readTime}
            </div> */}
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="ghost" size="sm" className="group/btn w-full justify-between">
            Đọc thêm
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Category Sidebar
  const CategorySidebar = () => (
    <div className="rounded-sm bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Danh mục</h3>
      <div className="space-y-2">
        {newsCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setSelectedCategory(category.slug);
            }}
            className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm transition-colors ${
              selectedCategory === category.slug ? "bg-primaryColor text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>{category.name}</span>
            <span className={`text-xs ${selectedCategory === category.slug ? "text-white/80" : "text-gray-500"}`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // Popular Tags
  const PopularTags = () => (
    <div className="rounded-sm bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Thẻ phổ biến</h3>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag, index) => (
          <button
            key={index}
            className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-primaryColor hover:text-white"
          >
            <Tag className="h-3 w-3" />
            {tag}
          </button>
        ))}
      </div>
    </div>
  );

  // Search Box
  const SearchBox = () => (
    <div className="rounded-sm bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Tìm kiếm</h3>
      <div className="relative">
        <input
          type="text"
          onChange={(e) => {}}
          placeholder="Nhập từ khóa..."
          className="w-full rounded-sm border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primaryColor focus:outline-none focus:ring-1 focus:ring-primaryColor"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="px-5 pt-[60px] lg:pt-[80px]">
      {/* Breadcrumb */}
      <div className="my-5">
        <Breadcrumb
          items={[
            {
              label: "Tin tức",
              path: "/news",
            },
          ]}
        />
      </div>

      {/* Header */}
      <div className="my-8 rounded-sm bg-white p-8">
        <Headline text1="cập nhật xu hướng mới nhất" text2="TIN TỨC THỜI TRANG" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main Content Area */}
        <div className="lg:w-3/4">
          {/* Featured Article */}
          <div className="mb-8">
            <FeaturedArticle article={mockNewsData.featured} />
          </div>

          {/* Articles Grid */}
          <div className="mb-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Tất cả bài viết
              <span className="ml-2 text-sm font-normal text-gray-500">({115} bài viết)</span>
            </h2>

            {mockNewsData.articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {mockNewsData.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-sm bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">Không tìm thấy bài viết</h3>
                <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
                <Button
                  variant="ghost"
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategory("all");
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="space-y-6">
            <SearchBox />
            <CategorySidebar />
            <PopularTags />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsPage;
