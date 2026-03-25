import React from "react";
import {
HiOutlineHeart,
HiOutlineChat,
HiOutlineBookmark
} from "react-icons/hi";

export default function CommentSection(){

return(

<div className="w-1/3 bg-[#111] text-white flex flex-col">

{/* header */}

<div className="p-4 border-b border-gray-700 font-semibold">
hastivasani
</div>

{/* comments */}

<div className="flex-1 overflow-y-auto p-4 space-y-4">

<p className="text-sm">
<span className="font-semibold">
bamniyasatish212
</span> Khubsurat
</p>

<p className="text-sm">
<span className="font-semibold">
u_r_v_i_2_9
</span> 🔥❤️
</p>

</div>

{/* actions */}

<div className="border-t border-gray-700 p-4">

<div className="flex gap-4 mb-3">

<HiOutlineHeart size={26}/>

<HiOutlineChat size={26}/>

<HiOutlineBookmark size={26} className="ml-auto"/>

</div>

<p className="text-sm text-gray-300 mb-3">
Liked by savaj_963 and 93 others
</p>

<input
type="text"
placeholder="Add a comment..."
className="w-full bg-transparent outline-none text-sm"
/>

</div>

</div>

);

}