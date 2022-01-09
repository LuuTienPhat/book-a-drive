const list = document.getElementsByClassName(
  "list-group list-group-flush mt-3"
)[0];

btnRefresh.addEventListener("click", () => {
  getList();
});

btnConnect.addEventListener("click", () => {
  socket.emit("CONNECT");
});

const getList = () => {
  axios
    .get("http://localhost:3001/list")
    .then((res) => res.data)
    .then((data) => {
      renderList(data);
    });
};

getList();

const renderList = (data) => {
  const result = data.map((each) => {
    return `<div
                class="d-flex align-items-center justify-content-start py-2 px-2 px-2 border border-primary border-2 rounded mb-2"
                data-drive = "${each.MACHUYEN}"
                id="place-item"
              >
                <div class="p-0 d-flex flex-column align-items-center">
                  <i class="bi bi-rulers" style="font-size: 20px"></i>
                  <span class="text-nowrap" style="font-size: 14px">
                    
                  </span>
                </div>
                <div class="px-3 overflow-hidden w-100">
                  <h5 class="text-truncate text-danger mb-0">
                    <small style="font-size: 12px" >Điểm đến:</small>
                    ${each.DIEMDEN}
                  </h5>
                  <h5
                    class="text-truncate text-primary"
                  >
                    <span style="font-size: 12px">Điểm đón:</span>
                    ${each.DIEMDON}
                  </h5>
                  <p
                    class="text-truncate mb-0"
                  >
                    <small style="font-size: 12px">Quãng đường:</small>
                    ${kilometerFormat(each.QUANGDUONG)}
                  </p>
                  <p
                    class="text-truncate mb-0"
                  >
                    <small style="font-size: 12px" >Thành tiền:</small>
                    ${vietnamMoneyFormat(each.TIEN)}
                  </p>
                </div>
                <div>
                  <i class="bi bi-arrow-right-circle-fill" style="font-size: 20px"></i>
                </div>
            </div>`;
  });

  list.innerHTML = result.join("");

  const placeItems = document.querySelectorAll("#place-item");
  placeItems.forEach((placeItem) => {
    placeItem.addEventListener("click", () => {
      window.location.href = `/driver/drive/${placeItem.dataset.drive}`;
    });
  });
};

socket.on("RENDER_LIST", () => {
  getList();
  console.log("render in socket");
});
