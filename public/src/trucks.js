/**
 * Browse Trucks Page - Display available food trucks
 * API: GET /api/v1/trucks/view
 */

$(document).ready(function() {
  loadTrucks();

  function loadTrucks() {
    $('#loadingState').show();
    $('#trucksContainer').empty();
    $('#emptyState').hide();

    apiClient.get('/api/v1/trucks/view')
      .done(function(trucks) {
        $('#loadingState').hide();
        
        if (!trucks || trucks.length === 0) {
          $('#emptyState').show();
          return;
        }

        trucks.forEach(function(truck) {
          const truckCard = createTruckCard(truck);
          $('#trucksContainer').append(truckCard);
        });
      })
      .fail(function(xhr) {
        $('#loadingState').hide();
        if (xhr.status === 401 || xhr.status === 403) {
          window.location.href = '/';
        } else {
          $('#emptyState').show();
        }
      });
  }

  function createTruckCard(truck) {
    const logoUrl = truck.truckLogo || '/images/404.jpg';
    const truckName = truck.truckName || 'Unnamed Truck';
    
    return `
      <div class="col-md-4 col-sm-6" style="margin-bottom: 30px;">
        <div class="glass-card" style="padding: 25px; height: 100%;">
          <div class="text-center">
            ${truck.truckLogo ? 
              `<img src="${logoUrl}" alt="${truckName}" style="max-width: 150px; max-height: 150px; border-radius: 10px; margin-bottom: 15px;" />` :
              `<div style="width: 150px; height: 150px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 3rem;">🍔</div>`
            }
            <h3 style="margin-bottom: 15px; color: #fff;">${truckName}</h3>
            <p class="text-muted" style="margin-bottom: 20px;">
              Status: <span class="badge badge-success">Available</span>
            </p>
            <button class="btn btn-primary btn-block" onclick="window.location.href='/truckMenu/${truck.truckId}'">
              View Menu
            </button>
          </div>
        </div>
      </div>
    `;
  }
});

