import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SchemaDiscovery({ field, field_info }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleCard = () => {
    setIsOpen(!isOpen);
  };
  const type = field_info.type;
  const desc = field_info.description;
  const allowed_values = field_info.allowed_values;
  const example = field_info.example;
  const filter = field_info.filterable;
  const categorical = field_info.categorical;

  return (
    <div
      className="pointer-events-auto border select-none relative rounded-xl w-full !h-fit"
      onClick={() => setIsOpen(false)}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggleCard();
        }}
        className="flex flex-row items-center justify-between bg-[#001FB0] rounded-t-xl h-fit cursor-pointer"
      >
        <span className="block text-lg py-2 px-4 text-white rounded-t-xl oswald">
          DATA DISCOVERY
        </span>
        {isOpen && (
          <div
            className={cn(
              `bg-[#001FB0] absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-2 grid-rows-2 rounded-b-xl gap-3 justify-center items-center p-5`,
            )}
          >
            <div className="flex flex-col !gap-0">
              <span className="poppins text-sm font-extrabold text-white">
                Data Discovery
              </span>
              <span className="poppins text-xs italic text-gray-300">
                All background schema information of the requested parameter
                displayed here
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-row w-full gap-2 rounded-b-xl !p-0 !m-0 h-32 bg-gray-50 poppins">
        <div className="relative flex flex-col justify-center items-center  w-full h-full">
          <p className=" oswald text-[#001FB0] text-lg  text-center">
            PARAMETER
          </p>
          <p className="poppins text-black text-lg text-center">{field}</p>
        </div>
        <div className="w-1 h-full bg-gray-500"></div>
        <div className="relative flex flex-col justify-center items-center  w-full h-full">
          <p className=" oswald text-[#001FB0] text-lg  text-center">
            DESCRIPTION
          </p>
          <p className="poppins text-black text-lg text-center">{desc}</p>
        </div>
        <div className="w-1 h-full bg-gray-500"></div>
        <div className="overflow-y-auto relative flex flex-col justify-center items-center w-full h-full">
          <p className="oswald text-[#001FB0] text-lg ">ALLOWED VALUES</p>
          <div className="flex flex-col gap-1 text-left">
            {allowed_values.map((element, index) => (
              <span
                key={index}
                className="poppins text-black text-lg text-center"
              >
                {element}
              </span>
            ))}
          </div>
        </div>
        <div className="w-1 h-full bg-gray-500"></div>
        <div className="relative flex flex-col justify-center items-center  w-full h-full">
          <p className=" oswald text-[#001FB0] text-lg  text-center">EXAMPLE</p>
          <p className="poppins text-black text-lg text-center">{example}</p>
        </div>
        <div className="w-1 h-full bg-gray-500"></div>
        <div className="relative flex flex-col justify-center items-center  w-full h-full">
          <p className=" oswald text-[#001FB0] text-lg  text-center">FILTER?</p>
          <p className="poppins text-black text-lg text-center">
            {filter ? "True" : "False"}
          </p>
        </div>
        <div className="w-1 h-full bg-gray-500"></div>
        <div className="relative flex flex-col justify-center items-center  w-full h-full">
          <p className=" oswald text-[#001FB0] text-lg  text-center">
            CATEGORICAL?
          </p>
          <p className="poppins text-black text-lg text-center">
            {categorical ? "True" : "False"}
          </p>
        </div>
      </div>
    </div>
  );
}
