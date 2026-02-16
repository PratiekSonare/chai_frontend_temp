export default function Searchbar({ searchbarRef, placeholder, inputValue, setInputValue, onSearch }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch(inputValue);
    }
  };

  return (
    <div ref={searchbarRef} className="flex flex-col items-center" style={{width: "75%"}}>
      <div className="relative searchCard example-2 w-full">
        <div className="inner border border-blue-300 h-20">
          <div className='p-2 flex flex-row items-center justify-center h-full'>
            <svg className='w-8 ml-2' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M10 5C7.23858 5 5 7.23858 5 10C5 12.7614 7.23858 15 10 15C11.381 15 12.6296 14.4415 13.5355 13.5355C14.4415 12.6296 15 11.381 15 10C15 7.23858 12.7614 5 10 5ZM3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 11.5719 16.481 13.0239 15.6063 14.1921L20.7071 19.2929C21.0976 19.6834 21.0976 20.3166 20.7071 20.7071C20.3166 21.0976 19.6834 21.0976 19.2929 20.7071L14.1921 15.6063C13.0239 16.481 11.5719 17 10 17C6.13401 17 3 13.866 3 10Z" fill="#001FB0"></path> </g></svg>
            <input
              className="flex-10/12 focus:outline-none !ml-3 poppins !text-lg transition-all duration-300"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className="h-full flex flex-1/6 items-center justify-center text-white bg-[#0019B1] !rounded-xl scale-100 active:scale-95 transition-all duration-100"
              onClick={() => onSearch(inputValue)}
            >
              <svg className="w-10" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <g fill="none" fillRule="evenodd" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" transform="translate(3 3)">
                    <path d="m6.5 10.5 3-3-3-3"></path>
                    <path d="m5 3v9" transform="matrix(0 1 -1 0 12.5 2.5)"></path>
                    <path d="m1.5 5.5v-3.0079176c0-1.10147263.89060277-1.99561512 1.99206673-1.99998427l7.95228497-.03160773c1.1045608-.00432011 2.0035361.8875515 2.0079175 1.99211231l.0398162 10.02918369c.0043323 1.1045608-.8875404 2.003535-1.9921012 2.0079309-.0026436 0-.0052873 0-.0079309 0h-7.9920533c-1.1045695 0-2-.8954305-2-2v-2.9897173"></path>
                  </g>
                </g>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <span className="absolute -top-5 text-xs py-1 px-4 bg-[#001FB0] text-white rounded-t-xl oswald">SEARCH</span>
    </div>
  );
}
