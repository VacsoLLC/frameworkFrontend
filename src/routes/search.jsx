import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {useBackend} from '../lib/usebackend.js';
import {useNavigate} from 'react-router-dom';
import {Input} from '../components/ui/input.jsx';
import {Button, buttonVariants} from '../components/ui/button.jsx';
import {Loader2} from 'lucide-react';

const ListTemplate = ({item}) => {
  const [expanded, setExpanded] = useState(false);
  const [showExpand, setShowExpand] = useState(false);
  const contentRef = React.useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (contentRef.current) {
      setShowExpand(contentRef.current.scrollHeight > 96); // 96px is 6rem (h-24)
    }
  }, [item]);

  const toggleExpand = () => {
    if (showExpand) {
      setExpanded(!expanded);
    }
  };

  return (
    <div
      className="pt-2 mb-2 mr-2 w-full bg-gray-100 p-3 rounded cursor-pointer relative  transition-all duration-300"
      onClick={toggleExpand}
    >
      <div className="mb-2">
        <a
          href="#"
          className={buttonVariants({variant: 'outline'})}
          onClick={(e) => {
            e.stopPropagation();
            navigate(
              `/${item.searchDb}/${item.searchTable}/${item.searchRecordId}`,
            );
          }}
        >
          {`/${item.searchDb}/${item.searchTable}/${item.searchRecordId}`}
        </a>
      </div>
      <div
        ref={contentRef}
        className={`overflow-hidden ${expanded ? 'max-h-full' : 'max-h-24'}`}
      >
        <pre className="m-0 p-0 whitespace-pre-wrap">{item.searchText}</pre>
      </div>
      {showExpand && !expanded && (
        <div className="arrow-container">
          <i className="pi pi-chevron-down" style={{fontSize: '0.8rem'}}></i>
        </div>
      )}
    </div>
  );
};

export default function Search() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('value');
    if (query) {
      setSearchQuery(query);
      setSearchTrigger((prev) => prev + 1);
    }
  }, [location]);

  const [results, loading, error] = useBackend({
    packageName: 'core',
    className: 'search',
    methodName: 'search',
    args: {
      query: searchQuery,
    },
    enabled: searchQuery ? true : false,
    reload: searchTrigger,

    timeout: 5000,
  });

  console.log(results?.data?.results, 'logg');
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTrigger((prev) => prev + 1);
  };

  return (
    <div className="m-2">
      <form onSubmit={handleSearch} className="flex w-full items-center">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow rounded-r-none"
        />
        <Button type="submit" className="rounded-l-none">
          Search
        </Button>
      </form>

      {(loading || results) && (
        <div className="search-results mt-0">
          <div className=" mt-3 mb-3">
            <font size="5" className="pr-2">
              Search Results
            </font>
            {loading && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
            {error && !loading && (
              <>
                An error occured updating the search results. Please try again.
                Error: {error.message}
              </>
            )}
          </div>

          {results &&
            results.data &&
            results.data.results &&
            results.data.results.map((item) => (
              <ListTemplate item={item} key={item._id} />
            ))}
          {loading && !results && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
        </div>
      )}
    </div>
  );
}
