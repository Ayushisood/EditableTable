import { useEffect, useState } from "react";
import { IoIosAddCircle } from "react-icons/io";
import { nanoid } from "nanoid";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { CSVLink } from "react-csv";

function App() {
  const [data, setData] = useState([]);
  const [heading, setHeading] = useState([]);
  const [addRow, setAddRow] = useState(false);
  const [addFormData, setAddFormData] = useState({});
  const [editDataRow, setEditDataRow] = useState(null);

  useEffect(() => {
    //fetch dummy data for content of the table
    const fetchData = async () => {
      await fetch("https://dummyjson.com/products")
        .then((response) => response.json())
        .then((json) => {
          const dataArr = [...json.products];

          //remove some key-value pairs from fetched result
          dataArr.map((obj) => {
            delete obj.description;
            delete obj.discountPercentage;
            delete obj.thumbnail;
            delete obj.images;
          });

          // console.log(dataArr);
          setData(dataArr);

          //extract keys as an array for table heading
          setHeading(Object.keys(dataArr[0]).filter((item) => item !== "id"));
        })
        .catch((err) => console.log(err.message));
    };

    fetchData();
  }, []);

  //function for handling and updating entered data for new row
  const handleAddFormChange = (event) => {
    event.preventDefault();
    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;

    const newFormData = { ...addFormData };
    //update the  keys with currently entered data
    newFormData[fieldName] = fieldValue;
    setAddFormData(newFormData);
    console.log(addFormData);
  };

  //function to handle form submision of new entries
  const handleFormSubmit = (event) => {
    event.preventDefault();
    setAddRow(false);

    //object with random id and entered data
    const newData = {
      id: nanoid(),
      ...addFormData,
    };

    const newEditedData = [...data];
    //add new row to the array of rows
    newEditedData.push(newData);
    setData(newEditedData);
  };

  //function to handle form submission of a edited row
  const handleEditFormSubmit = (event) => {
    event.preventDefault();

    const newData = {
      id: editDataRow,
      ...addFormData,
    };

    const newEditedData = [...data];
    //find index of the row being edited
    const index = data.findIndex((ob) => ob.id === editDataRow);

    //update the data with edited one at that found index
    newEditedData[index] = newData;
    setData(newEditedData);

    setEditDataRow(null);
  };

  //function to handle when user clicks edit
  const handleEditRow = (event, data) => {
    event.preventDefault();
    setEditDataRow(data.id);

    //remove id from object ,otherwise it will conflict when user adds a new row
    const dataWithoutId = (object, key) => {
      const { [key]: deletedKey, ...otherKeys } = object;
      return otherKeys;
    };

    const newData = { ...dataWithoutId(data, "id") };
    setAddFormData(newData);
  };

  //function to handle ,when user clicks cancel and don't want to edit the row
  const handleCancel = () => {
    setEditDataRow(null);
  };

  //function to handle deletion of a row
  const handleDelete = (rowId) => {
    const newData = [...data];

    //find id of row ,which  user wants to delete
    const index = newData.findIndex((rowData) => rowData.id === rowId);
    newData.splice(index, 1);
    setData(newData);
  };

  return (
    <div className="m-6 md:m-12">
      <header className="mb-8 border-b-4 border-gray-700 text-2xl  p-2 ">
        Store your details
      </header>
      <div>
        <div className="flex flex-col ">
          {/* Download CSV file  */}
          <CSVLink
            data={data}
            className="border-2 p-2 w-32 border-blue-500 hover:bg-blue-400 font-semibold rounded-md hover:text-white"
          >
            Download{" "}
            <HiOutlineDocumentDownload className="h-7 w-7 inline-block" />
          </CSVLink>

          <div className="overflow-x-auto  ">
            <div className="py-4 inline-block min-w-full ">
              <div className="overflow-hidden">
                <table className="min-w-full text-center table-auto">
                  <thead className="border-b bg-blue-500">
                    {/* table heading */}
                    <tr id="heading">
                      {heading.map((headingItem) => (
                        <th className="tableHeading">{headingItem}</th>
                      ))}
                      <th className="tableHeading">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((obj) => (
                      <tr className="bg-gray-700 border-b border-gray-400">
                        {Object.entries(obj).map(
                          ([key, value]) =>
                            key !== "id" && (
                              <>
                                {/* if user clicks edit ,show input field else show data */}
                                {editDataRow === obj.id ? (
                                  <td className="tableCol">
                                    <input
                                      type="text"
                                      placeholder={key}
                                      name={key}
                                      defaultValue={value}
                                      className="outline-none p-1 rounded-sm bg-gray-300"
                                      onChange={handleAddFormChange}
                                    />
                                  </td>
                                ) : (
                                  <>
                                    <td className="tableCol">{value}</td>
                                  </>
                                )}
                              </>
                            )
                        )}
                        {/* buttons to show , when user edits the row */}
                        <td className="">
                          {editDataRow === obj.id ? (
                            <>
                              <button
                                className="text-green-600 underline font-semibold border-r-2 border-gray-400 pr-1 mr-1"
                                onClick={handleEditFormSubmit}
                              >
                                save
                              </button>
                              <button
                                className="text-red-600 underline font-semibold"
                                onClick={handleCancel}
                              >
                                cancel
                              </button>
                            </>
                          ) : (
                            <>
                              {/* icons to provide edit/delete functionality to a row  */}
                              <FaEdit
                                className="cursor-pointer w-6 h-6 mx-auto pr-1 text-green-600 border-r-2 inline-block border-gray-400"
                                onClick={(event) => {
                                  handleEditRow(event, obj);
                                }}
                              />

                              <RiDeleteBin5Fill
                                className="cursor-pointer w-6 h-6 inline-block ml-1 text-red-700"
                                onClick={() => handleDelete(obj.id)}
                              />
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Want to add a row ? */}
      {!addRow && (
        <div className="flex text-lg font-semibold underline mt-4">
          <h2>Add a row</h2>{" "}
          <IoIosAddCircle
            className="h-8 w-8 ml-1 text-red-700 cursor-pointer"
            onClick={() => setAddRow(true)}
          />
        </div>
      )}
      {/* form to enter data for new row */}
      {addRow && (
        <form onSubmit={handleFormSubmit}>
          {heading.map((text) => (
            <input
              className="inputField"
              type="text"
              name={text}
              placeholder={text}
              onChange={handleAddFormChange}
              required
            />
          ))}
          <button
            type="submit"
            className="bg-red-600 px-4 py-2 text-white rounded-md"
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
}

export default App;
