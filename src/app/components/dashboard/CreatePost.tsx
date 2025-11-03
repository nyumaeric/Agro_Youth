"use client"
import { useState } from "react";

interface FormValues {
  title: string;
  content: string;
  category: string;
}

const PostForm: React.FC = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    title: "",
    content: "",
    category: "",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted: ", formValues);
    setIsFormOpen(false); 
  };

  const handleClose = () => {
    setFormValues({ title: "", content: "", category: "" });
    setIsFormOpen(false);
  };

  return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl absolute">
            <h2 className="text-2xl font-bold mb-4">Create a Post</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium">
                  Post Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formValues.title}
                  onChange={handleChange}
                  className="mt-2 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="content" className="block text-gray-700 font-medium">
                  Post Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formValues.content}
                  onChange={handleChange}
                  className="mt-2 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                  placeholder="Write your post content"
                  rows={4}
                  required
                ></textarea>
              </div>

              <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700 font-medium">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formValues.category}
                  onChange={handleChange}
                  className="mt-2 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="Technology">Technology</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
    </div>
  );
};

export default PostForm;
